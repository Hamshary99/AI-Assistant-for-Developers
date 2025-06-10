import { modelForStructuredResponse } from "../repositories/aiSchemaRepository.js";
import {
  buildFinalPrompt,
  buildFinalPromptCompare,
} from "../utils/promptHandler.js";


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

    const result = aiResponse.response.candidates[0].content.parts[0].text;
    //  console.log("textOnly | aiResponse", result);

    // Sanitize and parse
    const cleaned = result
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("structeredResponse | error", error);
    return { Error: "Uh oh! Caught error while fetching AI response" };
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

    const result = aiResponse.response.candidates[0].content.parts[0].text;
    //  console.log(" aiResponse", result);

    // Sanitize and parse
    const cleaned = result
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("structeredResponse | error", error);
    return { Error: "Uh oh! Caught error while fetching AI response" };
  }
};
