import { textOnly } from "./textResponse.js";
import {
  structuredResponse,
  structuredResponseCompare,
} from "./structuredResponse.js";
import { ApiError } from "../middleware/errorHandler.js";
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

    if (!description) {
      throw new ApiError("Project description is required", 400);
    }

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
    const fileContent = getFileContent(req);
    const finalRequirements = fileContent ? `${requirements}\n\n### Code Context from Files:\n${fileContent}` : requirements;

    if (!finalRequirements || !method) {
      throw new ApiError(
        "Both requirements and method are required for API suggestion",
        400
      );
    }

    const prompt = `
        Suggest a REST API endpoint structure for a ${method} endpoint that does the following: ${finalRequirements}
        
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
      prompt: `${method} - ${finalRequirements}`,
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

    if (!codeToExplain) {
      throw new ApiError("Code content is required for explanation", 400);
    }

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

    if (!codeToFix) {
      throw new ApiError("Code content is required for fixing", 400);
    }

    const prompt = `
You are an expert software engineer. Review the following ${programmingLanguage} code for bugs, logical errors, and areas for improvement.
The user has reported this issue: "${issueDescription || "No specific issue described, please perform a general review."}"

1.  **Analyze the code thoroughly.** Identify any functional bugs, logical flaws, or deviations from best practices.
2.  **Provide a brief overview** of the problems you've found.
3.  **Create a udiff** that corrects the identified issues. If there are no issues, the udiff should be empty.
4.  **List the corrections** line-by-line, explaining what was wrong and why your fix is better.
Do not suggest fixes for code that is not present.
`;

    const response = await structuredResponse(prompt, codeToFix);

    if (!response) {
      throw new ApiError("No response received from AI model.", 500);
    }

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
    const { oldCode: oldCodeText, newCode: newCodeText } = req.body;
    let oldCode = oldCodeText;
    let newCode = newCodeText;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const oldFile = req.files.find(f => f.fieldname === 'oldCodeFile');
      const newFile = req.files.find(f => f.fieldname === 'newCodeFile');
      if (oldFile) oldCode = oldFile.buffer.toString('utf-8');
      if (newFile) newCode = newFile.buffer.toString('utf-8');
    }

    if (!oldCode || !newCode) {
      throw new ApiError('Both old and new code snippets or files are required.', 400);
    }

    const prompt = `Compare the following two code snippets and provide a detailed analysis of the differences:\n\nOld Code:\n${oldCode}\n\nNew Code:\n${newCode}`;
    const response = await structuredResponseCompare(prompt, oldCode, newCode);

    await saveRequestHistory({
      requestType: "compareCode",
      prompt: `Comparing two code snippets.`, // Simplified prompt for history
      responseStructured: response,
    });

    return response;
  } catch (error) {
    throw new ApiError(
      error.message || "Failed to compare code",
      error.statusCode || 500
    );
  }
};
