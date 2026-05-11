const { param, body, query } = require('express-validator');
const { ALL_ROLES } = require('../../common/constants/roles');

const userIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID.'),
];

const updateRoleValidation = [
  param('id').isMongoId().withMessage('Invalid user ID.'),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(ALL_ROLES).withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),
];

const listUsersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100.'),
  query('role').optional().isIn(ALL_ROLES).withMessage(`Invalid role filter.`),
];

module.exports = {
  userIdValidation,
  updateRoleValidation,
  listUsersValidation,
};
