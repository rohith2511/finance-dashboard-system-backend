const mongoose = require('mongoose');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (mongoose.Error.ValidationError && err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation error',
      details: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate key error',
      details: err.keyValue
    });
  }

  const payload = {
    message: err.message || 'Internal Server Error'
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = { errorHandler };
