import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

import { appConfig } from "./config/appConfig.js";
import router from "./router/route.js";
import { logger, requestLogger } from "./utils/logger.js";
import { connectToDatabase } from "./db/dbService.js";
import webRouter from "./router/webRoute.js";
import { handleApiError } from "./utils/errorHandler.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

// Set up view engine and layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Serve static files from src/public
app.use(express.static(path.join(__dirname, "public")));

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

// Web routes for the UI
app.use("/", webRouter);

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
app.use("/", (err, req, res, next) => {
  handleApiError(err, req, res);
});

// Global error handler
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (error.statusCode == 404) {
    return res.status(404).render("error", {
      title: "Page Not Found",
      message: "The page you are looking for does not exist.",
      activePage: "", // Add empty string for 404 pages
    });
  }

  res.status(error.statusCode).json({
    status: error.statusCode || 500,
    message: error.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? error : {}, // Only show error details in development
  });

});

console.log("Using Gemini API Key: ", !!process.env.GEMINI_API_KEY);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
