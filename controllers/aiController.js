import { structeredResponse, structeredResponseCompare } from "../utils/structeredResponse.js";
import { textOnly } from "../utils/textOnly.js";
import { formatSuccessResponse, formatErrorResponse } from "./../utils/responseHandler.js";
import { logger } from "../utils/logger.js";
import { saveRequestHistory} from "../db/dbService.js";

export const generateReadme = async (req, res) => {
  try {
    const { projectDescription } = req.body;
    

    const prompt = `Generate a professional README.md for the following project: ${projectDescription}`;
    const response = await textOnly(prompt);
   
    const result = {
      content: response.result,
      requestType: "Generate Readme file",
      timeStamp: new Date().toISOString(),
    };

    await saveRequestHistory({
      userID: null, // userId,
      requestType: "generateReadme",
      prompt: prompt,
      responseRaw: result.responseRaw,
    });

    res.status(200).json(formatSuccessResponse(result, "README generated successfully"));

    // res.json(
    //   formatSuccessResponse(
    //     {
    //       content: response.result,
    //       requestType: "generateReadme",
    //       timeStamp: new Date().toISOString(),
    //     },
    //     "README generated successfully"
    //   )
    // );
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to generate README"));
  }
};

export const suggestApi = async (req, res) => {
  try {
    const { appIdea } = req.body;
    const prompt = `Suggest a REST API endpoint structure for this app idea: ${appIdea}`;
    const response = await textOnly(prompt);

    const result = {
      content: response.result,
      requestType: "Suggest API",
      timeStamp: new Date().toISOString(),
    };

    await saveRequestHistory({
      userID: null, // userId,
      requestType: "suggestApi",
      prompt: prompt,
      responseRaw: response,
    });

    res.status(200).json(formatSuccessResponse(result, "API suggestion generated successfully"));

    // res.json(formatSuccessResponse({
    //   content: response.result,
    //   requestType: "suggest API",
    //   timeStamp: new Date().toISOString()
    // }, "API suggestion generated successfully"));


  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to suggest API"));
  }
};

export const explainCode = async (req, res) => {
  try {
    const { code } = req.body;
    const prompt =
      "“Please respond with a JSON object with keys overview, line_reviews, and udiff. Do not wrap your output in markdown or code fences.”";
    // const prompt = `${promptHeader}\n\nCode:\n\n${code}`;
    const response = await structeredResponse(prompt, code);

    
    const result = {
      content: response,
      requestType: "Explain code",
      timeStamp: new Date().toISOString(),
    };

    await saveRequestHistory({
      userID: null, // userId,
      requestType: "explainCode",
      prompt: code,
      responseStructured: result,
    });

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          result,
          "Code explanation generated successfully"
        )
      );

    // res.status(200).json(formatSuccessResponse(result, "Code explanation generated successfully"));
    // res.status(200).json(formatSuccessResponse({
    //   content: response.result,
    //   requestType: "Explain code",
    //   timeStamp: new Date().toISOString()
    // }, "Code explanation generated successfully"));


  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to explain code"));
  }
};

export const fixCode = async (req, res) => {
  try {
    const { code } = req.body;
    const prompt = `Fix the errors in the following code and ensure it is syntactically correct and optimized:\n\n`;
    const response = await structeredResponse(prompt, code);

    const result = {
      content: response,
      requestType: "Fix code",
      timeStamp: new Date().toISOString(),
    };

    await saveRequestHistory({
      userID: null, // userId,
      requestType: "fixCode",
      prompt: code,
      responseStructured: result,
    });

   return res
     .status(200)
     .json(
       formatSuccessResponse(
         result,
         "Code fix generated successfully"
       )
     );
    // res.json(formatSuccessResponse({
    //   content: response.result,
    //   requestType: "Fix code",
    //   timeStamp: new Date().toISOString()
    // }, "Code fixed successfully"));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to fix code"));
  }
};

export const compareCode = async (req, res) => {
  try {
    const { oldCode, newCode } = req.body;
    const prompt = `Compare the following two code snippets and provide a detailed analysis of the differences:\n\nOld Code:\n${oldCode}\n\nNew Code:\n${newCode}`;
    const response = await structeredResponseCompare(
      prompt,
      oldCode,
      newCode
    );

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
      .json(formatSuccessResponse(result, "Code comparison completed successfully"));
    // res.json(formatSuccessResponse({
    //   content: response.result,
    //   requestType: "Compare code",
    //   timeStamp: new Date().toISOString()
    // }, "Code comparison completed successfully"));
  } catch (error) {
    res.status(500).json(formatErrorResponse(error, "Failed to compare code"));
  }
}



// Add a new endpoint to fetch user history
export const getUserRequestHistory = async (req, res) => {
  try {
    // const userId = getUserId(req);
    const limit = parseInt(req.query.limit) || 10;
    
    // Import directly here to avoid circular dependencies
    const { getUserHistory } = await import('../utils/dbService.js');
    const history = await getUserHistory(limit);
    // const history = await getUserHistory(userId, limit);
    
    res.json(formatSuccessResponse({
      history,
      count: history.length
    }, "User history retrieved successfully"));
  } catch (error) {
    logger.error('Error retrieving user history', error);
    res.status(500).json(formatErrorResponse(error, "Failed to retrieve history"));
  }
};