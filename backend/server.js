import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import fs from "fs"; // for debug

// Rate Limiters
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

//config
dotenv.config();

const app = express();
const __dirname = path.resolve();

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

// Global rate limiting
app.use(globalLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log({
    time: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
  });
  next();
});

// Static files
app.use("/uploads", express.static("uploads"));

// Mount auth routes
app.use("/auth", authRoutes);

// Test endpoint for cloudinary
app.get("/test-cloudinary", (req, res) => {
  res.json({
    configured: !!cloudinary.config().cloud_name,
    cloudName: cloudinary.config().cloud_name,
  });
});

// Other routes (no limiter on products to avoid 429 on featured)
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoute);
app.use("/coupon", couponRoutes);
app.use("/payments", paymentLimiter, paymentRoutes);
app.use("/analytics", analyticsRoute);

// Serve frontend static files in production
// Try multiple possible locations for the frontend build output
const possiblePaths = [
  path.join(__dirname, "frontend", "dist"),
  path.join(__dirname, "dist"),
  path.join(process.cwd(), "frontend", "dist"),
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    frontendPath = p;
    console.log(`Frontend dist found at: ${p}`);
    break;
  }
}

if (!frontendPath) {
  console.log("Frontend dist NOT found. Searched paths:", possiblePaths);
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

  // Catch-all for SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(500).send("Server Error");
      }
    });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await connectDB();
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
});
