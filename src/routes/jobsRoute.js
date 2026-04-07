const express = require('express');
const router = express.Router();
const { createJob, getJobs, deleteJob,updateJob, applyToJob, getJobApplicants, reviewApplication } = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');

// Public route: Anyone can see the job list
router.get('/', getJobs);

// Protected route: You MUST be logged in to post or delete
router.post('/', protect, createJob);
router.delete('/:id', protect, deleteJob);
router.put('/:id', protect, updateJob);
// Candidate Route: Apply for a job
router.post('/:id/apply', protect, applyToJob);
router.put('/applications/:id/review', protect, reviewApplication);
// Employer Route: See who applied
router.get('/:id/applicants', protect, getJobApplicants);

module.exports = router;