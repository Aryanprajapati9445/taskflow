const { error } = require('../utils/response.utils');
const HTTP = require('../constants/httpStatus');

/**
 * Middleware: Check if authenticated user has one of the required roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, HTTP.UNAUTHORIZED, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        HTTP.FORBIDDEN,
        'Access denied. Insufficient permissions.'
      );
    }

    next();
  };
};

module.exports = authorize;
