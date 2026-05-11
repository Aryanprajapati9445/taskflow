const Task = require('./task.model');
const { ROLES } = require('../../common/constants/roles');

class TaskService {
  /**
   * Create a new task — owner is the authenticated user
   */
  async create(data, userId) {
    const task = await Task.create({ ...data, createdBy: userId });
    return task;
  }

  /**
   * Get tasks for the authenticated user (with pagination, filtering, sorting)
   */
  async getMyTasks(userId, query) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
      search,
    } = query;

    const filter = { createdBy: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email'),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  /**
   * Get a single task by ID — users can only see their own, admins can see any
   */
  async getById(taskId, user) {
    const task = await Task.findById(taskId)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }

    // Ownership check: users can only see their own tasks
    if (user.role !== ROLES.ADMIN && task.createdBy._id.toString() !== user.id) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }

    return task;
  }

  /**
   * Update a task — ownership enforced
   */
  async update(taskId, data, user) {
    const task = await Task.findById(taskId);

    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== ROLES.ADMIN && task.createdBy.toString() !== user.id) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }

    Object.assign(task, data);
    await task.save();

    return task;
  }

  /**
   * Delete a task — ownership enforced
   */
  async delete(taskId, user) {
    const task = await Task.findById(taskId);

    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== ROLES.ADMIN && task.createdBy.toString() !== user.id) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }

    await Task.findByIdAndDelete(taskId);
  }

  /**
   * Admin: get ALL tasks across all users
   */
  async getAllTasks(query) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
      search,
    } = query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email'),
      Task.countDocuments(filter),
    ]);

    return {
      tasks,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }
}

module.exports = new TaskService();
