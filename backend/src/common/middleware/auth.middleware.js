const { verifyToken } = require('../utils/jwt.utils');
const { error } = require('../utils/response.utils');
const HTTP = require('../constants/httpStatus');
const User = require('../../modules/user/user.model');

/**
 * Middleware: Verify JWT access token from Authorization header.
 * Attaches decoded user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, HTTP.UNAUTHORIZED, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Ensure user still exists and is active
    const user = await User.findById(decoded.id).select('name email role isActive');
    if (!user || !user.isActive) {
      return error(res, HTTP.UNAUTHORIZED, 'User not found or deactivated.');
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, HTTP.UNAUTHORIZED, 'Token expired. Please refresh.');
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, HTTP.UNAUTHORIZED, 'Invalid token.');
    }
    next(err);
  }
};

module.exports = authenticate;
