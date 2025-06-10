import mongoose from "mongoose";
import { logger } from "../middleware/logger.js";
import { requestHistorySchema } from "../models/db/dbSchema.js";

export const connectToDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB successfully.");
    return true;
  } catch (error) {
    logger.error("Failed to connect to MongoDB", error);
    return false;
  }
};

export const RequestHistory = mongoose.model(
  "Requests History",
  requestHistorySchema,
  "Requests History"
);
