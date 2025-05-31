import { GoogleGenerativeAI } from "@google/generative-ai";

import { aiConfig } from "../config/aiConfig.js";
import { schema } from "../config/schema.js";
import { buildFinalPrompt, buildFinalPromptCompare } from "./promptHandler.js";


const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);

const model = genAI.getGenerativeModel({
  model: aiConfig.gemini.textOnlyModel, // Updated to use textOnlyModel
  safetySettings: aiConfig.gemini.safetySettings,
  // generationConfig: aiConfig.gemini.generationConfig,
  generationConfig: {
        responseMimeType: "application/json", // Enforces JSON output
        responseSchema: schema,               // Uses the schema above
      }
});


// This function is used for a text only model of Gemini AI
export const structuredResponse = async (prompt, code) => {
  try {
    const finalPrompt = buildFinalPrompt(prompt, code);

    // console.log("\n\nstructuredResponse | finalPrompt", finalPrompt);
    // const result = await model.generateContent(promptWithExample);
    const aiResponse = await model.generateContent({
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

    // console.log("\n\nstructuredResponseCompare | finalPrompt", finalPrompt);
    // const result = await model.generateContent(promptWithExample);
    const aiResponse = await model.generateContent({
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

