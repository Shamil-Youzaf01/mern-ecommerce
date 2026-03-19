import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

// Connect to Redis
const redis = new Redis(process.env.REDIS_URL);

const keyGenerator = (req) => req.user?._id?.toString() || req.ip;

const createLimiter = (options) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => {
        // Log every rate limit check
        console.log(`[RateLimit] ${args[0].toUpperCase()}`, args.slice(1));
        return redis.call(...args);
      },
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
  windowMs: 5 * 60 * 1000,
  max: 120,
  message: "Too many login/signup attempts. Try again later.",
});

export const paymentLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  skip: (req) => req.method === "OPTIONS",
  message: "Too many payment attempts. Please wait before trying again.",
});
