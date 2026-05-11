const logger = require('../utils/logger');
const { error } = require('../utils/response.utils');
const HTTP = require('../constants/httpStatus');

/**
 * Global error handling middleware.
 * Catches everything that slips through route handlers.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return error(res, HTTP.BAD_REQUEST, 'Validation error.', errors);
  }

  // Mongoose duplicate key (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return error(res, HTTP.CONFLICT, `${field} already exists.`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return error(res, HTTP.BAD_REQUEST, `Invalid ${err.path}: ${err.value}`);
  }

  // Default — don't leak stack traces in production
  const statusCode = err.statusCode || HTTP.INTERNAL_SERVER;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  return error(res, statusCode, message);
};

module.exports = errorHandler;
