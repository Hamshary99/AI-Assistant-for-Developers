import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

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


const requestHistorySchema = new mongoose.Schema({
  userID: {
      // **TBD**
        type: String,
        required: false,
        index: true,
    },
    requestType: {
        type: String,
        required: true,
        enum: [
            "generateReadme",
            "suggestApi",
            "explainCode",
            "fixCode",
        ],
    },
    prompt: {
        type: String,
        required: true,
    },
    timeStamp: {
        type: Date,
        default: Date.now,
    },
    metaData: {
        type: Object,
        default: {},
  },
    responseStructured: {
        type: Object,
        default: {},
  },
    responseRaw: {
        type: String,
        default: "",
    },
});

// Third argument is to force the collection name in MongoDB without pluralization or lowercasing
export const RequestHistory = mongoose.model(
  "Requests History",
  requestHistorySchema,
  "Requests History"
);

// Function to save request history
export const saveRequestHistory = async (data) => {
  try {
    if (!mongoose.connection.readyState) {
      logger.warn('Database connection not available, skipping history save');
      return null;
    }
    
    const historyEntry = new RequestHistory(data);
    await historyEntry.save();
    logger.info('Saved request history', { id: historyEntry._id });
    return historyEntry;
  } catch (error) {
    logger.error('Failed to save request history', error);
    return null;
  }
};


// Function to get history for a user
export const getUserHistory = async (limit = 10) => {
  try {
    if (!mongoose.connection.readyState) {
      logger.warn('Database connection not available, cannot retrieve history');
      return [];
    }
    
    // const history = await RequestHistory.find({ userId })
    const history = await RequestHistory.find({})
      .sort({ timestamp: -1 })
      .limit(limit);
      
    return history;
  } catch (error) {
    logger.error('Failed to retrieve user history', error);
    return [];
  }
};