const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    // req.user.id comes from our 'protect' middleware
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'fullName company');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    // Check if job exists and if the user is the one who posted it
    if (job && job.postedBy.toString() === req.user.id.toString()) {
      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(401).json({ message: 'Not authorized to delete this' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update a job
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 1. Check if the logged-in user is the owner of the job
    if (job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this job' });
    }

    // 2. Update the job with the new data from req.body
    // { new: true } returns the updated document instead of the old one
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const Application = require('../models/Application');

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
exports.applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const candidateId = req.user.id;

    // 1. Check if the user already applied
    const alreadyApplied = await Application.findOne({ job: jobId, candidate: candidateId });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // 2. Create the application
    const application = await Application.create({
      job: jobId,
      candidate: candidateId
    });

    res.status(201).json({ message: 'Application submitted successfully!', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all applicants for a specific job
// @route   GET /api/jobs/:id/applicants
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // 1. Security Check: Only the owner of the job can see applicants
    if (job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these applicants' });
    }

    // 2. Fetch applications and "Populate" the candidate details (including the resume URL!)
    const applications = await Application.find({ job: req.params.id })
      .populate('candidate', 'fullName email resumeUrl phone') 
      .sort('-createdAt');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};