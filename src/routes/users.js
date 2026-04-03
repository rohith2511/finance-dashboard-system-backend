const express = require('express');
const Joi = require('joi');

const { validate } = require('../middleware/validate');
const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../middleware/asyncHandler');
const userController = require('../controllers/userController');

const router = express.Router();

const createUserSchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  email: Joi.string().trim().email().max(320).required(),
  role: Joi.string().valid('viewer', 'analyst', 'admin').required(),
  status: Joi.string().valid('active', 'inactive').required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().max(120),
  email: Joi.string().trim().email().max(320),
  role: Joi.string().valid('viewer', 'analyst', 'admin'),
  status: Joi.string().valid('active', 'inactive')
}).min(1);

// POST /users
// - Bootstrap: if no users exist, creates the first admin without auth.
// - Otherwise: admin-only.
router.post('/', validate(createUserSchema), asyncHandler(userController.createUser));

// GET /users (admin-only)
router.get('/', requireRole(['admin']), asyncHandler(userController.listUsers));

// Optional admin user management
router.put('/:id', requireRole(['admin']), validate(updateUserSchema), asyncHandler(userController.updateUser));
router.delete('/:id', requireRole(['admin']), asyncHandler(userController.deleteUser));

module.exports = router;
