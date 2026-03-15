import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import csrf from "csurf";
import helmet from "helmet";

// Rate Limiters
import {
  globalLimiter,
  paymentLimiter,
  productLimiter,
  cartLimiter,
  orderLimiter,
} from "./middleware/rateLimiter.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import orderRoute from "./routes/order.route.js";

import { connectDB } from "./lib/db.js";

//config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Global rate limiting
app.use(globalLimiter);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "res.cloudinary.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://api.razorpay.com"],
        frameSrc: ["https://api.razorpay.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:5173"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/uploads", express.static("uploads"));

const csrfMiddleware = csrf({
  cookie: {
    name: "XSRF-TOKEN",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
});

// CSRF token endpoint
app.get("/api/csrf-token", csrfMiddleware, (req, res) => {
  res.json({ csrfToken: req.csrfToken?.() || "" });
});

// Custom middleware to skip CSRF for specific routes
const csrfSkipper = (req, res, next) => {
  const skipRoutes = [
    "/api/auth",
    "/api/products",
    "/api/cart",
    "/api/orders",
    "/api/payments",
    "/api/coupon",
  ];

  const shouldSkip = skipRoutes.some((route) =>
    req.originalUrl.startsWith(route),
  );

  if (shouldSkip) return next();
  return csrfMiddleware(req, res, next);
};

// CSRF skipper to all /api routes
app.use("/api", csrfSkipper);

app.use("/api/auth", authRoutes);
app.use("/api/products", productLimiter, productRoutes);
app.use("/api/cart", cartLimiter, cartRoutes);
app.use("/api/orders", orderLimiter, orderRoute);
app.use("/api/coupon", couponRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/analytics", analyticsRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  connectDB();
});
