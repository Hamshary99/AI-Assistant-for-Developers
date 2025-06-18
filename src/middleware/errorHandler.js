class BaseError extends Error {
  constructor(message, statusCode) {
    super(message); // calls the parent constructor with the error message
    this.statusCode = statusCode;
    this.name = "Base_Error"; // sets the name of the error
  }
}

export class ApiError extends BaseError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "Api_Error";
  }
}

export class AiError extends BaseError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "Ai_Error";
  }
}

export const handleApiError = (err, req, res) => {
  console.error(`[${new Date().toISOString()}]`, err);

  const errStatusCode = err.statusCode || 500;
  return res.status(errStatusCode).json({
    status: errStatusCode,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
};


export const handleAiError = (err, req, res) => {
  console.error(`[${new Date().toISOString()}]`, err);

  const errStatusCode = err.statusCode || 500;
  return res.status(errStatusCode).json({
    status: errStatusCode,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
};

export const handleError =(err, req, res, next) => {
  if(err instanceof ApiError) {
    return handleApiError(err, req, res);
  }
  else if(err instanceof AiError) {
    return handleAiError(err, req, res);
  }
  else {
    console.error(`[${new Date().toISOString()}]`, err);
    return res.status(500).json({
      status: err.statusCode || 500,
      message: err.message || "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  }
};

