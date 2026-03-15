import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
  googleAuth,
  getAllUsers,
  deleteUser,
  createAdmin,
  updateAddress,
  deleteAddress,
} from "../controllers/auth.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.post("/google", authLimiter, googleAuth);
router.get("/all", authLimiter, protectRoute, adminRoute, getAllUsers);
router.put("/address", protectRoute, updateAddress);
router.delete("/address", protectRoute, deleteAddress);
router.post("/", protectRoute, adminRoute, createAdmin);
router.delete("/:userId", protectRoute, adminRoute, deleteUser);

export default router;
