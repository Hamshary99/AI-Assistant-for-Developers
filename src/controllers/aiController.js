import { marked } from "marked";
import { handleApiError } from "../utils/errorHandler.js";

import {
  postGenerateReadmeApi,
  postSuggestApi,
  postExplainCodeApi,
  postFixCodeApi,
  postCompareCodeApi,
} from "../services/postApiServices.js";

export const generateReadme = async (req, res) => {
  try {
    const response = await postGenerateReadmeApi(req);

    return res.status(200).json({
      requestType: "Generate README",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    return handleApiError(error, req, res);
  }
};

export const suggestApi = async (req, res) => {
  try {
    const response = await postSuggestApi(req);

    return res.status(200).json({
      requestType: "Suggest Api",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    return handleApiError(error, req, res);
  }
};

export const explainCode = async (req, res) => {
  try {
    const response = await postExplainCodeApi(req);

    return res.status(200).json({
      requestType: "Explain Code",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    return handleApiError(error, req, res);
  }
};

export const fixCode = async (req, res) => {
  try {
    const response = await postFixCodeApi(req);

    return res.status(200).json({
      requestType: "Fix code",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    return handleApiError(error, req, res);
  }
};

export const compareCode = async (req, res) => {
  try {
    const response = await postCompareCodeApi(req);

    return res.status(200).json({
      requestType: "Compare code",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    return handleApiError(error, req, res);
  }
};

// Add a new endpoint to fetch user history
export const getUserRequestHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { getUserHistory } = await import(
      "../repositories/dbManagerRepository.js"
    );
    const history = await getUserHistory(limit);

    if (!history || history.length === 0) {
      return res.status(200).json({
        requestType: "Get User History",
        timeStamp: new Date().toISOString(),
        content: {
          history: [],
          count: 0,
        },
      });
    }

    // Format history data with markdown
    const formattedHistory = history.map((item) => {
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
    res.status(error.statusCode || 500).render("error", {
      title: "Error",
      message: "Failed to retrieve history",
      activePage: "",
    });
  }
};
