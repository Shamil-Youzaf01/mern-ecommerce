import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

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

export const createNewCoupon = async (userId) => {
  try {
    await Coupon.findOneAndUpdate({ userId }, { isActive: false });

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

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const existingOrder = await Order.findOne({
      user: req.user._id,
      couponCode: code,
      status: "paid",
    });

    if (existingOrder) {
      return res.status(400).json({ message: "Coupon has already been used" });
    }

    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Coupon not found" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: "Coupon expired" });
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
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
