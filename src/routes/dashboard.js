const express = require('express');

const { requireRole } = require('../middleware/requireRole');
const { asyncHandler } = require('../middleware/asyncHandler');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Analyst/Admin: summary access
router.get('/summary', requireRole(['analyst', 'admin']), asyncHandler(dashboardController.summary));

module.exports = router;
