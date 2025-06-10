import { modelForTextResponse } from "../repositories/aiSchemaRepository.js";

export const textOnly = async (prompt) => {

  // prompt is a single string
  try {
    const result = await modelForTextResponse.generateContent(prompt);
    const chatResponse = result?.response?.text();

    return { result: chatResponse };
  } catch (error) {
    // console.error("textOnly | error", error);
    return { Error: "Uh oh! Caught error while fetching AI response" };
  }
};