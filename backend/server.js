import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";

import { globalLimiter, paymentLimiter } from "./middleware/rateLimiter.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import orderRoute from "./routes/order.route.js";

import { connectDB } from "./lib/db.js";
import cloudinary from "./lib/cloudinary.js";
import { protectRoute } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

// Trust proxy (for Render)
app.set("trust proxy", 1);

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://orbit-ecommerce-frontend.onrender.com",
    ],
    credentials: true,
  }),
);

// Security Headers with Helmet
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

// Global Rate Limiting
const excludedRateLimitPaths = ["/payments", "/cart", "/orders"];

app.use((req, res, next) => {
  const isExcluded = excludedRateLimitPaths.some((path) =>
    req.path.startsWith(path),
  );

  if (isExcluded) return next();

  globalLimiter(req, res, next);
});

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoute);
app.use("/coupon", couponRoutes);

// Protected + Rate Limited Payment Routes
app.use("/payments", protectRoute, paymentLimiter, paymentRoutes);
app.use("/analytics", analyticsRoute);

const possibleFrontendPaths = [
  path.join(__dirname, "frontend", "dist"),
  path.join(__dirname, "dist"),
  path.join(process.cwd(), "frontend", "dist"),
];

let frontendPath = null;

for (const p of possibleFrontendPaths) {
  if (fs.existsSync(p)) {
    frontendPath = p;
    console.log(`✅ Frontend dist found at: ${p}`);
    break;
  }
}

if (!frontendPath) {
  console.warn(
    "⚠️  Frontend dist folder NOT found. Searched paths:",
    possibleFrontendPaths,
  );
}

if (frontendPath) {
  app.use(
    express.static(frontendPath, {
      setHeaders: (res, filepath) => {
        if (filepath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        } else if (filepath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        }
      },
    }),
  );

  // SPA Fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(500).send("Server Error");
      }
    });
  });
}

// Start Server

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await connectDB();
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit process if DB fails
  }
});
