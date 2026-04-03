const express = require('express');

const { mockAuth } = require('../middleware/mockAuth');

const userRoutes = require('./users');
const recordRoutes = require('./records');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

// Attaches req.user (from x-user-id) when provided
router.use(mockAuth);

router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
