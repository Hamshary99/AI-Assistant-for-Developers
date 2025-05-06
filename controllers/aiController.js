import {
  structeredResponse,
  structeredResponseCompare,
} from "../utils/structeredResponse.js";
import { textOnly } from "../utils/textOnly.js";
import {
  formatSuccessResponse,
  formatErrorResponse,
} from "./../utils/responseHandler.js";
import { logger } from "../utils/logger.js";
import { saveRequestHistory } from "../db/dbService.js";
import { marked } from "marked";

export const generateReadme = async (req, res) => {
  try {
    const { projectDescription } = req.body;
    const prompt = `Generate a professional README.md for the following project: ${projectDescription}. Include sections for Description, Features, Installation, Usage, API (if applicable), Contributing, and License.`;
    const response = await textOnly(prompt);

    await saveRequestHistory({
      userID: null,
      requestType: "generateReadme",
      prompt: projectDescription,
      responseRaw: response.result,
    });

    res.status(200).json(
      formatSuccessResponse(
        {
          content: response.result,
          requestType: "generateReadme",
          timeStamp: new Date().toISOString(),
        },
        "README generated successfully"
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(formatErrorResponse(error, "Failed to generate README"));
  }
};

export const suggestApi = async (req, res) => {
  try {
    const { requirements, method } = req.body;
    const prompt = `Suggest a REST API endpoint structure for a ${method} endpoint that does the following: ${requirements}. Include path parameters, query parameters, request body schema, and response schema where applicable.`;
    const response = await textOnly(prompt);

    await saveRequestHistory({
      userID: null,
      requestType: "suggestApi",
      prompt: `${method} - ${requirements}`,
      responseRaw: response.result,
    });

    res.status(200).json(
      formatSuccessResponse(
        {
          content: response.result,
          requestType: "suggestApi",
          timeStamp: new Date().toISOString(),
        },
        "API suggestion generated successfully"
      )
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to suggest API"));
  }
};

export const explainCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const prompt = `Please analyze the following ${language} code and provide a detailed code review. Include overview, line-by-line explanation, and best practices.`;

    const response = await structeredResponse(prompt, code);

    await saveRequestHistory({
      userID: null,
      requestType: "explainCode",
      prompt: code,
      responseStructured: response,
    });

    res.status(200).json(
      formatSuccessResponse(
        {
          content: response,
          requestType: "explainCode",
          timeStamp: new Date().toISOString(),
        },
        "Code explanation generated successfully"
      )
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to explain code"));
  }
};

export const fixCode = async (req, res) => {
  try {
    const { code, issue, language } = req.body;
    const prompt = `Review and fix the following ${language} code${
      issue ? ` that has this issue: ${issue}` : ""
    }. Provide a detailed analysis of issues and necessary fixes.`;

    const response = await structeredResponse(prompt, code);

    await saveRequestHistory({
      userID: null,
      requestType: "fixCode",
      prompt: `${code}\nIssue: ${issue || "No specific issue mentioned"}`,
      responseStructured: response,
    });

    console.log("fixCode | response", response);
    res.status(200).json(
      formatSuccessResponse(
        {
          content: response,
          requestType: "fixCode",
          timeStamp: new Date().toISOString(),
        },
        "Code fixed successfully"
      )
    );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to fix code"));
  }
};

export const compareCode = async (req, res) => {
  try {
    const { oldCode, newCode } = req.body;
    const prompt = `Compare the following two code snippets and provide a detailed analysis of the differences:\n\nOld Code:\n${oldCode}\n\nNew Code:\n${newCode}`;
    const response = await structeredResponseCompare(prompt, oldCode, newCode);

    const result = {
      content: response,
      requestType: "Compare code",
      timeStamp: new Date().toISOString(),
    };

    await saveRequestHistory({
      userID: null, // userId,
      requestType: "compareCode",
      prompt: `${oldCode} vs ${newCode}`,
      responseStructured: result,
    });

    return res
      .status(200)
      .json(
        formatSuccessResponse(result, "Code comparison completed successfully")
      );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to compare code"));
  }
};

// Add a new endpoint to fetch user history
export const getUserRequestHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { getUserHistory } = await import("../db/dbService.js");
    const history = await getUserHistory(limit);

    if (!history || history.length === 0) {
      return res.status(200).json(
        formatSuccessResponse(
          {
            history: [],
            count: 0,
          },
          "No history found"
        )
      );
    }

    // Format history data with markdown
    const formattedHistory = history.map((item) => {
      const timestamp = new Date(item.timeStamp).toLocaleString();
      let content = "";

      // Format response based on request type and content
      if (
        item.responseStructured &&
        Object.keys(item.responseStructured).length > 0
      ) {
        const response = item.responseStructured;
        if (
          item.requestType === "fixCode" ||
          item.requestType === "explainCode"
        ) {
          content = `### Overview\n${
            response.overview
          }\n\n### Issues Found\n${response.line_reviews
            .map(
              (review) =>
                `- **Line ${review.line}** (${review.review_type}): ${review.review}`
            )
            .join("\n")}\n\n### Code Changes\n\`\`\`diff\n${
            response.udiff || "No changes required"
          }\n\`\`\``;
        } else {
          // For other structured responses
          content = "```json\n" + JSON.stringify(response, null, 2) + "\n```";
        }
      } else if (item.responseRaw) {
        content = item.responseRaw;
      }

      const formattedMarkdown = `### Input\n\`\`\`\n${item.prompt}\n\`\`\`\n\n### Response\n${content}`;

      return {
        ...item.toObject(),
        responseRaw: formattedMarkdown, // Use responseRaw since that's what the template expects
      };
    });

    // Get total pages
    const totalPages = Math.ceil(history.length / limit);
    const currentPage = parseInt(req.query.page) || 1;

    res.render("history", {
      title: "Request History",
      activePage: "history",
      history: formattedHistory,
      currentPage: currentPage,
      totalPages: totalPages,
      marked: marked,
    });
  } catch (error) {
    logger.error("Error retrieving user history", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to retrieve history",
      activePage: "",
    });
  }
};
