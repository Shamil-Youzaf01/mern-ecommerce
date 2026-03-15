import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserOrders);

router.get("/all", protectRoute, adminRoute, getAllOrders);

router.patch("/:orderId/status", protectRoute, adminRoute, updateOrderStatus);

router.delete("/:orderId", protectRoute, adminRoute, deleteOrder);

export default router;
