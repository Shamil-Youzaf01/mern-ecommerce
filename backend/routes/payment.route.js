import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  cancelOrder,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protectRoute, createRazorpayOrder);
router.post("/verify-payment", protectRoute, verifyRazorpayPayment);
router.post("/cancel-order", protectRoute, cancelOrder);

export default router;
