exports.handle404s = ((_, __, next) => {
  const error = {
    statusCode: 404,
    message: "Resource not found",
    status: "Not Found"
  };
  next(error);
});

exports.errorHandler = ((error, _, res, next) => {
  res.status(error.statusCode || 500).json({
    statusCode: error.statusCode,
    status: error.status || "failed",
    message: error.message,
    stack: error.stack,
    ...error,
  });
  
  next();
});