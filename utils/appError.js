const appError = (statusCode, message, next) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  next(error);
}

module.exports = appError;