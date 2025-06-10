import mongoose from "mongoose";

export const requestHistorySchema = new mongoose.Schema({
  requestType: {
    type: String,
    required: true,
    enum: [
      "generateReadme",
      "suggestApi",
      "explainCode",
      "fixCode",
      "compareCode",
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