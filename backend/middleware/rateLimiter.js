import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

// Connect to Redis
const redis = new Redis(process.env.REDIS_URL);

const keyGenerator = (req) => req.user?._id?.toString() || req.ip;

const createLimiter = (options) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,
    ...options,
  });

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please slow down.",
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: "Too many login/signup attempts. Try again later.",
});

export const cartLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 500,
  message: "Too many cart operations, please try again later.",
});

export const paymentLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many payment attempts. Please wait before trying again.",
});

export const productLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many product requests, please slow down.",
});

export const orderLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many order requests, please try again later.",
});
