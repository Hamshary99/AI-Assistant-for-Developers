
const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  DEBUG: "DEBUG",
};

// Base logger function
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };

  console.log(JSON.stringify(logEntry));

  // Return the log entry (useful for storing logs)
  return logEntry;
};


// Logger methods for different levels
export const logger = {
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data)
};


// Middleware for request logging
// Middleware for request logging
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
    method: req.method,
    path: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Log response (but don't log full body for large responses)
    logger.info(`Response sent for ${req.method} ${req.originalUrl}`, {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: Buffer.from(body).length
    });
    
    // Call original send
    originalSend.call(this, body);
  };

  next();
};