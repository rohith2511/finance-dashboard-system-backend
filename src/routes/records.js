const express = require('express');
const Joi = require('joi');

const { validate } = require('../middleware/validate');
const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../middleware/asyncHandler');
const recordController = require('../controllers/recordController');

const router = express.Router();

const recordCreateSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().max(80).required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().trim().max(500).allow('', null)
});

const recordUpdateSchema = Joi.object({
  amount: Joi.number().min(0),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(80),
  date: Joi.date().iso(),
  notes: Joi.string().trim().max(500).allow('', null)
}).min(1);

// Admin: create/update/delete
router.post('/', requireRole(['admin']), validate(recordCreateSchema), asyncHandler(recordController.createRecord));
router.put('/:id', requireRole(['admin']), validate(recordUpdateSchema), asyncHandler(recordController.updateRecord));
router.delete('/:id', requireRole(['admin']), asyncHandler(recordController.deleteRecord));

// Viewer/Analyst/Admin: read
router.get('/', requireRole(['viewer', 'analyst', 'admin']), asyncHandler(recordController.listRecords));

module.exports = router;
