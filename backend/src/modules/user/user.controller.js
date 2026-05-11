const userService = require('./user.service');
const { success } = require('../../common/utils/response.utils');
const HTTP = require('../../common/constants/httpStatus');

const getAll = async (req, res, next) => {
  try {
    const { users, meta } = await userService.getAll(req.query);
    return success(res, HTTP.OK, 'Users retrieved.', { users }, meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    return success(res, HTTP.OK, 'User retrieved.', { user });
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const user = await userService.updateRole(req.params.id, req.body.role);
    return success(res, HTTP.OK, 'User role updated.', { user });
  } catch (err) {
    next(err);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const user = await userService.deactivate(req.params.id);
    return success(res, HTTP.OK, 'User deactivated.', { user });
  } catch (err) {
    next(err);
  }
};

const activate = async (req, res, next) => {
  try {
    const user = await userService.activate(req.params.id);
    return success(res, HTTP.OK, 'User activated.', { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, updateRole, deactivate, activate };
