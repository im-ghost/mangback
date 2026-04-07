const express = require('express');
const router = express.Router();
const { createJob, getJobs, deleteJob,updateJob } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');

// Public route: Anyone can see the job list
router.get('/', getJobs);

// Protected route: You MUST be logged in to post or delete
router.post('/', protect, createJob);
router.delete('/:id', protect, deleteJob);
router.put('/:id', protect, updateJob);

module.exports = router;