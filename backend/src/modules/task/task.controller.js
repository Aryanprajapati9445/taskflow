const taskService = require('./task.service');
const { success } = require('../../common/utils/response.utils');
const HTTP = require('../../common/constants/httpStatus');

const create = async (req, res, next) => {
  try {
    const task = await taskService.create(req.body, req.user.id);
    return success(res, HTTP.CREATED, 'Task created.', { task });
  } catch (err) {
    next(err);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const { tasks, meta } = await taskService.getMyTasks(req.user.id, req.query);
    return success(res, HTTP.OK, 'Tasks retrieved.', { tasks }, meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const task = await taskService.getById(req.params.id, req.user);
    return success(res, HTTP.OK, 'Task retrieved.', { task });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const task = await taskService.update(req.params.id, req.body, req.user);
    return success(res, HTTP.OK, 'Task updated.', { task });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await taskService.delete(req.params.id, req.user);
    return success(res, HTTP.OK, 'Task deleted.');
  } catch (err) {
    next(err);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { tasks, meta } = await taskService.getAllTasks(req.query);
    return success(res, HTTP.OK, 'All tasks retrieved.', { tasks }, meta);
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getMyTasks, getById, update, remove, getAllTasks };
