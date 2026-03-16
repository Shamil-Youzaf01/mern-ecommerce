import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import csrf from "csurf";
import helmet from "helmet";
import fs from "fs"; // for debug

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
      const allowedOrigins = [
        "http://localhost:5173",
        "https://orbit-ecom.onrender.com",
      ];
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

// FIXED CSRF for same-domain deployment
const csrfMiddleware = csrf({
  cookie: {
    key: "XSRF-TOKEN",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"],
});

// CSRF token endpoint
app.get("/csrf-token", csrfMiddleware, (req, res) => {
  res.json({ csrfToken: req.csrfToken() || "" });
});

// Mount auth WITHOUT CSRF
app.use("/auth", authRoutes);

// Protect everything else
app.use(csrfMiddleware);

// Other routes (no limiter on products to avoid 429 on featured)
app.use("/products", productRoutes);
app.use("/cart", cartLimiter, cartRoutes);
app.use("/orders", orderLimiter, orderRoute);
app.use("/coupon", couponRoutes);
app.use("/payments", paymentLimiter, paymentRoutes);
app.use("/analytics", analyticsRoute);

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "..", "frontend", "dist"); // Exact match for Render /opt/render/project/src/frontend/dist
  // Debug: Log if dist exists and its contents
  if (fs.existsSync(frontendPath)) {
    console.log(
      `✅ frontend/dist exists. Contents: ${fs.readdirSync(frontendPath).join(", ")}`,
    );
  } else {
    console.log(`❌ frontend/dist NOT found at ${frontendPath}`);
  }

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB().catch((err) => console.error("DB connection failed:", err)); // debug
});
