import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { appConfig } from "./config/appConfig.js";
import router from "./router/route.js";
import { logger, requestLogger } from "./utils/logger.js";
import { connectToDatabase } from "./db/dbService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
dotenv.config();
const app = express();

app.use(
  cors({
    origin: appConfig.corsConfig.origin,
    methods: appConfig.corsConfig.methods,
    allowedHeaders: ["Content-Type", "application/json"],
  })
);

// Configure EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use(requestLogger);

// this makes all routes in aiRoutes available under /api/*
app.use("/api", router);

// Frontend routes
import webRouter from "./router/webRoutes.js";
app.use("/", webRouter);

// Connect to database (if configured)
connectToDatabase().then(connected => {
  if (connected) {
    logger.info('Database connection established');
  } else {
    logger.warn('Running without database connection - history features disabled');
  }
});


// Optional sanity check
app.get('/health', (req, res) => res.json({
  status: "OK",
  message: "Gemini API is running",
  version: process.env.APP_VERSION || '1.0.0',
  timestamp: new Date().toISOString()
}));


// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});


// console.log("Using OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);
console.log("Using Gemini API Key: ", !!process.env.GEMINI_API_KEY);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));