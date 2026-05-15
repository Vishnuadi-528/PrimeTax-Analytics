const env = require("../config/env");

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log full error only in development
  if (env.NODE_ENV !== "production") {
    console.error(err.stack);
  } else {
    console.error(err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
  });
};

module.exports = errorMiddleware;
