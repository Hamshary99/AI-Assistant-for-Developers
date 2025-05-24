
export const formatSuccessResponse = (data, message = "Operation successful") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export const formatErrorResponse = (error, message = "An error occurred") => { 
    return {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error",
    }
}


/**
 * Wraps a controller function to handle responses consistently.
 * 
 * @param {Function} controllerFn - The controller function to be wrapped. 
 *                                  It should return a result when invoked.
 * 
 * @returns {Function} - An asynchronous function that takes Express.js 
 *                       request, response, and next objects, executes the 
 *                       controller function, and sends a formatted JSON response.
 *                       If the controller function throws an error, a formatted 
 *                       error response is sent with a 500 status code.
 */

export const withResponseHandler = (controllerFn) => {
  return async (req, res, next) => {
    try {
      const result = await controllerFn(req);
      return res.json(formatSuccessResponse(result));
    } catch (error) {
      console.error(`Error in controller: ${error.message}`);
      return res.status(500).json(formatErrorResponse(error));
    }
  };
};