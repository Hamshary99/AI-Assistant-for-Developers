import mongoose from "mongoose";
import { logger } from "../middleware/logger.js";
import { RequestHistory } from "../config/dbConfig.js"

// Function to save request history
export const saveRequestHistory = async (data) => {
  try {
    if (!mongoose.connection.readyState) {
      logger.warn("Database connection not available, skipping history save");
      return null;
    }

    const historyEntry = new RequestHistory(data);
    await historyEntry.save();
    logger.info("Saved request history", { id: historyEntry._id });
    return historyEntry;
  } catch (error) {
    logger.error("Failed to save request history", error);
    return null;
  }
};

// Function to get history for a user
export const getUserHistory = async (limit = 10) => {
  try {
    if (!mongoose.connection.readyState) {
      logger.warn("Database connection not available, cannot retrieve history");
      return [];
    } // const history = await RequestHistory.find({ userId })
    const history = await RequestHistory.find({})
      .sort({ timeStamp: -1 })
      .limit(limit)
      .lean(); // Convert to plain JS objects

    return history;
  } catch (error) {
    logger.error("Failed to retrieve user history", error);
    return [];
  }
};
