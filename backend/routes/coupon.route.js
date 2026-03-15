import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getUserOrders } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUserOrders);

router.get("/all", protectRoute, adminRoute, (req, res) => {});

export default router;
