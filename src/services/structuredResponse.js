import { modelForStructuredResponse } from "../repositories/aiSchemaRepository.js";
import {
  buildFinalPrompt,
  buildFinalPromptCompare,
} from "../utils/promptHandler.js";
import { AiError } from "../middleware/errorHandler.js";

// This function is used for a text only model of Gemini AI
export const structuredResponse = async (prompt, code) => {
  try {
    const finalPrompt = buildFinalPrompt(prompt, code);

    const aiResponse = await modelForStructuredResponse.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: finalPrompt,
            },
          ],
        },
      ],
    });

    if (!aiResponse) {
      throw new AiError("No response received from AI model", 500);
    }

    const result = aiResponse.response.candidates[0].content.parts[0].text;
    //  console.log("textOnly | aiResponse", result);

    // Sanitize and parse
    const cleaned = result
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    throw new AiError(
      error.message || "Failed to generate text response",
      error.statusCode || 500
    );
  }
};

export const structuredResponseCompare = async (prompt, oldCode, newCode) => {
  try {
    const finalPrompt = buildFinalPromptCompare(prompt, oldCode, newCode);

    const aiResponse = await modelForStructuredResponse.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: finalPrompt,
            },
          ],
        },
      ],
    });

    if (!aiResponse) {
      throw new AiError("No response received from AI model", 500);
    }

    const result = aiResponse.response.candidates[0].content.parts[0].text;
    //  console.log(" aiResponse", result);

    // Sanitize and parse
    const cleaned = result
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    throw new AiError(
      error.message || "Failed to generate text response",
      error.statusCode || 500
    );
  }
};
