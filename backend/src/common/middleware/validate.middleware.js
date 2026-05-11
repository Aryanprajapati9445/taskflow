const { validationResult } = require('express-validator');
const { error } = require('../utils/response.utils');
const HTTP = require('../constants/httpStatus');

/**
 * Middleware factory: wraps express-validator checks for Express 5.
 * Instead of spreading validators as separate middleware (which breaks
 * in Express 5), this runs each validator manually via .run(req) and
 * then checks the results.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in parallel
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      return error(res, HTTP.UNPROCESSABLE, 'Validation failed.', extractedErrors);
    }

    next();
  };
};

module.exports = validate;
