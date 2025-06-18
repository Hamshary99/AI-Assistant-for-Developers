import { modelForTextResponse } from "../repositories/aiSchemaRepository.js";
import { AiError } from "../middleware/errorHandler.js";

export const textOnly = async (prompt) => {
  // prompt is a single string
  try {
    const result = await modelForTextResponse.generateContent(prompt);

    if (!result) {
      throw new AiError("No response received from AI model", 500);
    }

    const chatResponse = result?.response?.text();

    return { result: chatResponse };
  } catch (error) {
    // console.error("textOnly | error", error);
    throw new AiError(
      error.message || "Failed to generate text response",
      error.statusCode || 500
    );
  }
};
