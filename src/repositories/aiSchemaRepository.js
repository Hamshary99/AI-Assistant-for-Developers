import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig } from "../config/aiConfig.js";
import { schema } from "../models/responseSchema/responseSchema.js";

const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);

export const modelForStructuredResponse = genAI.getGenerativeModel({
  model: aiConfig.gemini.textOnlyModel, // Updated to use textOnlyModel
  safetySettings: aiConfig.gemini.safetySettings,
  // generationConfig: aiConfig.gemini.generationConfig,
  generationConfig: {
    responseMimeType: "application/json", // Enforces JSON output
    responseSchema: schema, // Uses the schema above
  },
});


export const modelForTextResponse = genAI.getGenerativeModel({
  model: aiConfig.gemini.textOnlyModel,
  safetySettings: aiConfig.gemini.safetySettings,
});
