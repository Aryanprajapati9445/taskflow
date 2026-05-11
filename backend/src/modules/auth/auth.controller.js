const authService = require('./auth.service');
const { success, error } = require('../../common/utils/response.utils');
const HTTP = require('../../common/constants/httpStatus');

/**
 * Controllers are thin — they only handle HTTP concerns.
 * All business logic lives in the service layer.
 */

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return success(res, HTTP.CREATED, 'User registered successfully.', { user });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, HTTP.OK, 'Login successful.', result);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    return success(res, HTTP.OK, 'Token refreshed.', tokens);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return success(res, HTTP.OK, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };
