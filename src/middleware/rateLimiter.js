import rateLimit from "express-rate-limit";
import { logger } from "./logger.js";

const formatTimeLeft = (timeLeft) => {
  const seconds = Math.ceil(timeLeft / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const handler = (req, res, next, options) => {
  const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
  res.status(options.statusCode).json({
    message: `Too many requests, please try again after ${retryAfter} seconds.`,
    retryAfter: retryAfter,
  });
};

// Create rate limiter instance for POST requests
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs for testing
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip non-POST requests
    if (req.method !== "POST") return true;

    // Apply rate limiting only to AI/ML endpoints that consume significant resources
    const aiEndpoints = [
      '/generate-readme',
      '/suggest-api',
      '/explain-code',
      '/fix-code',
      '/compare-code',
    ];
    // The rate limiter is mounted on `/api`, so `req.path` will be relative
    // (e.g., '/generate-readme').
    return !aiEndpoints.some((endpoint) => req.path.startsWith(endpoint));
  },
  handler,
});
