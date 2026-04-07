const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { getPendingEmployers, updateEmployerStatus } = require('../controllers/adminController');

// All routes here require being logged in AND being an admin
router.get('/pending', protect, isAdmin, getPendingEmployers);
router.put('/verify', protect, isAdmin, updateEmployerStatus);

module.exports = router;