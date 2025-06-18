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

// Create rate limiter instance for POST requests
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip non-POST requests
    if (req.method !== "POST") return true;

    // Apply rate limiting only to AI/ML endpoints that consume significant resources
    const aiEndpoints = [
      "/api/generate-readme",
      "/api/suggest-api",
      "/api/explain-code",
      "/api/fix-code",
      "/api/compare-code",
    ];
    return !aiEndpoints.some((endpoint) => req.path.startsWith(endpoint));
  },
  handler: (req, res) => {
    const timeLeft = req.rateLimit.resetTime - Date.now();
    const resetTime = new Date(req.rateLimit.resetTime);

    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      currentRequests: req.rateLimit.current,
      remainingRequests: req.rateLimit.remaining,
      resetTime: resetTime.toISOString(),
    });

    // Calculate what percentage of the limit has been used
    const usagePercent = Math.round(
      (req.rateLimit.current / req.rateLimit.limit) * 100
    );

    const responseDetails = {
      timeLeft: formatTimeLeft(timeLeft),
      currentRequests: req.rateLimit.current,
      maxRequests: req.rateLimit.limit,
      resetTime: formatDateTime(resetTime),
      usagePercent,
      userIP: req.ip,
    }; // Always return JSON response for better UX with notifications
    res.setHeader("Retry-After", Math.ceil(timeLeft / 1000));
    return res.status(429).json({
      success: false,
      message:
        "To ensure the best experience for all users, we need a quick pause.",
      details: {
        ...responseDetails,
        suggestedAction:
          "Your request will be processed automatically when the limit resets.",
      },
      code: "RATE_LIMIT_PAUSE",
    });
  },
});
