import crypto from "crypto";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { razorpay } from "../lib/razorpay.js";
import { createNewCoupon } from "./coupon.controller.js";

export const createRazorpayOrder = async (req, res) => {
  try {
    const existingCart = await Cart.findOne({ user: req.user._id });
    if (
      existingCart?.checkoutLockedUntil &&
      new Date(existingCart.checkoutLockedUntil) > new Date()
    ) {
      return res.status(409).json({
        error:
          "Checkout already in progress in another tab/window. Please wait or refresh.",
      });
    }

    // Locks the cart for 3 minutes
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { checkoutLockedUntil: new Date(Date.now() + 3 * 60 * 1000) },
    );

    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid products" });
    }

    let originalAmount = 0;
    products.forEach((p) => {
      originalAmount += (p.price || 0) * (p.quantity || 1);
    });

    let totalAmount = originalAmount;
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (appliedCoupon) {
        couponDiscount =
          (originalAmount * appliedCoupon.discountPercentage) / 100;
        totalAmount = originalAmount - couponDiscount;
      } else {
        return res.status(400).json({ error: "Invalid or expired coupon" });
      }
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    });

    const order = await Order.create({
      user: req.user._id,
      products: products.map((p) => ({
        product: p._id,
        quantity: p.quantity || 1,
        price: p.price || 0,
      })),
      totalAmount,
      originalAmount,
      couponCode: couponCode || null,
      couponDiscount,
      couponApplied: !!couponCode,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    res.status(200).json({
      razorpayOrderId: razorpayOrder.id,
      mongoOrderId: order._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Invalid payment data - null values received" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    await Cart.findOneAndUpdate(
      { user: order.user },
      { checkoutLockedUntil: null },
    );

    if (order.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.couponCode, userId: order.user },
        { isActive: false },
      );
    }

    const originalAmount =
      order.originalAmount ||
      order.products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (originalAmount >= 200) {
      const hasActive = await Coupon.findOne({
        userId: order.user,
        isActive: true,
      });

      if (!hasActive) {
        await createNewCoupon(order.user);
      }
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res
      .status(500)
      .json({ error: "Payment verification failed", details: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Clears the checkout lock
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { checkoutLockedUntil: null },
    );

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: "cancelled" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel order" });
  }
};
