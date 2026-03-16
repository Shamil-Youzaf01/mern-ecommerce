import rateLimit from "express-rate-limit";

// Trust proxy is required for Vercel deployments
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: 1,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: 1,
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many payment requests, please try again later",
  trustProxy: 1,
});

export const productLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many product requests, please try again later",
  trustProxy: 1,
});

export const cartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many cart operations, please try again later",
  trustProxy: 1,
});

export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many order requests, please try again later",
  trustProxy: 1,
});
