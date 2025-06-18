import { marked } from "marked";


import {
  postGenerateReadmeApi,
  postSuggestApi,
  postExplainCodeApi,
  postFixCodeApi,
  postCompareCodeApi,
} from "../services/postApiServices.js";

export const generateReadme = async (req, res, next) => {
  try {
    const response = await postGenerateReadmeApi(req);

    return res.status(200).json({
      requestType: "Generate README",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    next(error);
  }
};

export const suggestApi = async (req, res, next) => {
  try {
    const response = await postSuggestApi(req);

    return res.status(200).json({
      requestType: "Suggest Api",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    next(error);
  }
};

export const explainCode = async (req, res, next) => {
  try {
    const response = await postExplainCodeApi(req);

    return res.status(200).json({
      requestType: "Explain Code",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    next(error);
  }
};

export const fixCode = async (req, res, next) => {
  try {
    const response = await postFixCodeApi(req);
    
    return res.status(200).json({
      requestType: "Fix code",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    next(error); 
  }
};

export const compareCode = async (req, res, next) => {
  try {
    const response = await postCompareCodeApi(req);

    return res.status(200).json({
      requestType: "Compare code",
      timeStamp: new Date().toISOString(),
      content: response,
    });
  } catch (error) {
    next(error);
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

    // Format history data with markdown
    const formattedHistory = (history || []).map((item) => {
      let content = "";
      if (item.responseStructured && Object.keys(item.responseStructured).length > 0) {
        content = item.responseStructured;
      } else if (item.responseRaw) {
        content = { result: item.responseRaw };
      }
      return {
        prompt: item.prompt,
        response: content,
        requestType: item.requestType,
        timestamp: item.timeStamp,
      };
    });

    return res.status(200).json({
      requestType: "Get User History",
      timeStamp: new Date().toISOString(),
      content: {
        history: formattedHistory,
        count: formattedHistory.length,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: "Failed to retrieve history",
    });
  }
};
