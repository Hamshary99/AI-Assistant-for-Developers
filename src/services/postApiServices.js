import { textOnly } from "./textResponse.js";
import {
  structuredResponse,
  structuredResponseCompare,
} from "./structuredResponse.js";
import { ApiError } from "../utils/errorHandler.js";
import { saveRequestHistory } from "../repositories/dbManagerRepository.js";

const getFileContent = (req) => {
  if (req.files && req.files.length > 0) {
    return req.files
      .map(
        (file) =>
          `### File: ${file.originalname}\n\`\`\`${file.originalname
            .split(".")
            .pop()}\n${file.buffer.toString("utf-8")}\n\`\`\``
      )
      .join("\n\n");
  }
  return null;
};

export const postGenerateReadmeApi = async (req) => {
  try {
    const { projectDescription } = req.body;
    const fileContent = getFileContent(req);
    const description = fileContent
      ? `${projectDescription}\n\nProject File Contents:\n${fileContent}`
      : projectDescription;

    const prompt = `Generate a professional README.md for the following project: ${description}. 
            Include sections for Description, Features, Installation, Usage, API (if applicable), Contributing, and License.`;

    const response = await textOnly(prompt);

    await saveRequestHistory({
      requestType: "generateReadme",
      prompt: description,
      responseRaw: response.result,
    });

    return response;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to generate README",
      error.statusCode || 500
    );
  }
};

export const postSuggestApi = async (req) => {
  try {
    const { requirements, method } = req.body;
    const prompt = `
        Suggest a REST API endpoint structure for a ${method} endpoint that does the following: ${requirements}
        
        Format your response using this exact structure:
        
        **Method:** ${method}
        **Path:** <endpoint-path>
        **Parameters:**
        * \`parameter-name\` (type) - Description. Add '(Required)' for required parameters.
        
        ${
          method !== "GET"
            ? `Request Body:
        \`\`\`json
        {
          // Request body schema
        }
        \`\`\``
            : ""
        }
        
        Response:
        \`\`\`json
        {
          // Response schema
        }
        \`\`\`
        
        Include detailed descriptions and validation requirements.`;

    const response = await textOnly(prompt);

    await saveRequestHistory({
      requestType: "suggestApi",
      prompt: `${method} - ${requirements}`,
      responseRaw: response.result,
    });

    return response;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to suggest API",
      error.statusCode || 500
    );
  }
};

export const postExplainCodeApi = async (req) => {
  try {
    const { code, language } = req.body;
    const fileContent = getFileContent(req);
    const codeToExplain = fileContent || code;
    const programmingLanguage = language || "";

    const prompt = `Please analyze the following ${programmingLanguage} code and provide a detailed code review. 
            Include overview, line-by-line explanation, and best practices for each file.`;

    let response = await structuredResponse(prompt, codeToExplain);

    if (response.Error) {
      throw new Error(response.Error);
    }

    await saveRequestHistory({
      requestType: "explainCode",
      prompt: codeToExplain,
      responseStructured: response,
    });

    return response;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to explain code",
      error.statusCode || 500
    );
  }
};

export const postFixCodeApi = async (req) => {
  try {
    const { code, issue, language } = req.body;
    const fileContent = getFileContent(req);
    const codeToFix = fileContent || code;
    const programmingLanguage = language || "";
    const issueDescription = issue || "";

    const prompt = `Review and fix the following ${programmingLanguage} code${
      codeToFix ? ` that has this issue: ${issueDescription}` : ""
    }. If multiple files are provided, analyze and fix issues in each file. Provide a detailed analysis of issues and necessary fixes.`;

    const response = await structuredResponse(prompt, codeToFix);

    await saveRequestHistory({
      requestType: "fixCode",
      prompt: `${codeToFix}\nIssue: ${issue || "No specific issue mentioned"}`,
      responseStructured: response,
    });

    return response;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to fix code",
      error.statusCode || 500
    );
  }
};

export const postCompareCodeApi = async (req) => {
  try {
    const { oldCode, newCode } = req.body;
    const prompt = `Compare the following two code snippets and provide a detailed analysis of the differences:\n\nOld Code:\n${oldCode}\n\nNew Code:\n${newCode}`;
    const response = await structuredResponseCompare(prompt, oldCode, newCode);

    const result = {
      content: response,
      requestType: "Compare code",
      timeStamp: new Date().toISOString(),
    };

    await saveRequestHistory({
      requestType: "compareCode",
      prompt: `${oldCode} vs ${newCode}`,
      responseStructured: result,
    });

    return response;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to compare code",
      error.statusCode || 500
    );
  }
};
