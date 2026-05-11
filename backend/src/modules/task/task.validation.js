const { body, param, query } = require('express-validator');

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high.'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date.'),
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('assignedTo must be a valid user ID.'),
];

const updateTaskValidation = [
  param('id')
    .isMongoId().withMessage('Invalid task ID.'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done']).withMessage('Status must be todo, in-progress, or done.'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high.'),
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date.'),
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('assignedTo must be a valid user ID.'),
];

const taskIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid task ID.'),
];

const listTasksValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100.'),
  query('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status filter.'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority filter.'),
  query('sortBy').optional().isIn(['createdAt', 'dueDate', 'priority', 'status']).withMessage('Invalid sortBy field.'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc.'),
];

module.exports = {
  createTaskValidation,
  updateTaskValidation,
  taskIdValidation,
  listTasksValidation,
};
