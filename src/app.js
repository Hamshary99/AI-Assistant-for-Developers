import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { appConfig } from "./config/appConfig.js";
import router from "./router/route.js";
import { logger, requestLogger } from "./middleware/logger.js";
import { connectToDatabase } from "./config/dbConfig.js";
import { handleError } from "./middleware/errorHandler.js";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Import and apply the API rate limiter middleware
import { apiRateLimiter } from "./middleware/rateLimiter.js";

app.use("/api", apiRateLimiter);
// Middleware
app.use(
  cors({
    origin: appConfig.corsConfig.origin,
    methods: appConfig.corsConfig.methods,
  })
);

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  next(err);
});

app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use(requestLogger);

// API routes under /api/*
app.use("/api", router);

// Serve simple home page for users to access endpoints
app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "views", "home.html"));
});

// ===== Serve React production build =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactBuildPath = path.join(__dirname, "views", "dist");

app.use(express.static(reactBuildPath));

// SPA fallback: serve React app for any other route not starting with /api or having a file extension
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/api") &&
    path.extname(req.path) === ""
  ) {
    return res.sendFile(path.join(reactBuildPath, "index.html"));
  }
  next();
});
// ===== End React static serving =====

// Connect to database
connectToDatabase().then((connected) => {
  if (connected) {
    logger.info("Database connection established");
  } else {
    logger.warn(
      "Running without database connection - history features disabled"
    );
  }
});

// Health check endpoint
app.get("/health", (req, res) =>
  res.json({
    status: "OK",
    message: "Gemini Code Helper is running",
    version: process.env.APP_VERSION || "1.0.0",
    timestamp: new Date().toISOString(),
  })
);

// API error handling
app.use((err, req, res, next) => {
  handleError(err, req, res, next);
});

console.log("Using Gemini API Key: ", !!process.env.GEMINI_API_KEY);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
