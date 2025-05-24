export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
  }
}

export const handleApiError = (err, req, res) => {
  console.error("API Error:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response for unhandled errors
  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
