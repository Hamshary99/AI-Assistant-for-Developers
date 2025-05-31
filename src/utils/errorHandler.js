export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message); // calls the parent constructor with the error message
    this.statusCode = statusCode;
    this.name = "ApiError"; // sets the name of the error
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


// export const handleDbError = (err, req, res) => {
//   console.error("Database Error:", err);
//   const errorResponse = {
//     status: 500,
//     message: "Database Error",
//     timestamp: new Date().toISOString(),
//   };

//   // Log the error details for debugging
//   console.error("Error details:", errorResponse);

//   // Send a generic error response
//   return res.status(500).json(errorResponse);
// };