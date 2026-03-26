import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

// Get user's current available coupon
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    console.log("Error in the getCoupon controller");
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new coupon
export const createNewCoupon = async (userId) => {
  try {
    await Coupon.findOneAndUpdate({ userId });

    const newCoupon = new Coupon({
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId: userId,
    });
    await newCoupon.save();
    return newCoupon;
  } catch (error) {
    console.error("Error creating new coupon", error);
  }
};

// Coupon validation
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      userId: req.user._id,
      isActive: true,
      expirationDate: { $gt: new Date() },
    });

    if (!coupon) {
      const expiredCoupon = await Coupon.findOne({
        code: code.trim().toUpperCase(),
        userId: req.user._id,
      });

      if (expiredCoupon && expiredCoupon.expirationDate < new Date()) {
        expiredCoupon.isActive = false;
        await expiredCoupon.save();
        return res.status(400).json({ message: "Coupon has expired" });
      }

      return res.status(400).json({ message: "Coupon not found" });
    }

    const existingOrder = await Order.findOne({
      user: req.user._id,
      couponCode: coupon.code,
      status: "paid",
    });

    if (existingOrder) {
      return res.status(400).json({ message: "Coupon has already been used" });
    }

    res.json({
      message: "Coupon is valid",
      _id: coupon._id,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      expirationDate: coupon.expirationDate,
      isActive: coupon.isActive,
      userId: coupon.userId,
    });
  } catch (error) {
    console.error("Error in validateCoupon controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
