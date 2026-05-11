const User = require('./user.model');
const { ALL_ROLES } = require('../../common/constants/roles');

class UserService {
  /**
   * Get all users (paginated) — admin only
   */
  async getAll(query) {
    const { page = 1, limit = 10, search, role } = query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name email role isActive createdAt'),
      User.countDocuments(filter),
    ]);

    return {
      users,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getById(userId) {
    const user = await User.findById(userId).select('name email role isActive createdAt');

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return user;
  }

  /**
   * Update user's role
   */
  async updateRole(userId, newRole) {
    if (!ALL_ROLES.includes(newRole)) {
      const err = new Error(`Invalid role. Must be one of: ${ALL_ROLES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    ).select('name email role isActive');

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return user;
  }

  /**
   * Soft-delete a user (deactivate)
   */
  async deactivate(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('name email role isActive');

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return user;
  }

  /**
   * Re-activate a deactivated user
   */
  async activate(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('name email role isActive');

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    return user;
  }
}

module.exports = new UserService();
