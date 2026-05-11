const bcrypt = require('bcryptjs');
const User = require('../user/user.model');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../common/utils/jwt.utils');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err = new Error('Email already registered.');
      err.statusCode = 409;
      throw err;
    }

    const user = await User.create({ name, email, password });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Login user — returns access + refresh tokens
   */
  async login({ email, password }) {
    // Explicitly select password (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const tokenPayload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store hashed refresh token in DB
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required.');
      err.statusCode = 400;
      throw err;
    }

    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (e) {
      const err = new Error('Invalid or expired refresh token.');
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.isActive || !user.refreshToken) {
      const err = new Error('Invalid refresh token.');
      err.statusCode = 401;
      throw err;
    }

    // Compare the provided refresh token with the stored hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      const err = new Error('Refresh token has been revoked.');
      err.statusCode = 401;
      throw err;
    }

    // Rotate: issue new token pair
    const tokenPayload = { id: user._id, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout — invalidate refresh token
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

module.exports = new AuthService();
