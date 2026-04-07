const Job = require('../models/Job');
const Application = require('../models/Application');
const sendEmail = require('../utils/sendEmail');

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
    const { keyword, location, feature } = req.query;
    let query = {};

    // 1. Keyword Search (Matches Job Title or Company)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } }, // 'i' makes it case-insensitive
        { company: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 2. Location Filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // 3. Accessibility Feature Filter
    // This checks if the array 'accessibilityFeatures' contains the specific feature
    if (feature) {
      query.accessibilityFeatures = { $in: [feature] };
    }

    const jobs = await Job.find(query).sort('-createdAt');
    res.status(200).json(jobs);
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
// @desc    Review/Update an application (Employer only)
// @route   PUT /api/applications/:id/review
exports.reviewApplication = async (req, res) => {
  try {
    const { status, accommodationNotes } = req.body;
    
    // 1. Find the application and "Populate" the job details to check the owner
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // 2. Security Check: Is the logged-in user the one who posted the job?
    if (application.job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this application' });
    }

    // 3. Update the application
    application.status = status || application.status;
    application.accommodationNotes = accommodationNotes || application.accommodationNotes;

    
  // Notify the candidate if they are shortlisted
  if (status === 'shortlisted') {
    try {
      await sendEmail({
        email: application.candidate.email,
        subject: 'Good News: You have been shortlisted!',
        message: `Hello ${application.candidate.fullName}, your application for "${application.job.title}" has been shortlisted. The employer left these notes: ${accommodationNotes}`,
      });
    } catch (err) {
      console.error("Email failed to send, but status was updated.");
    }
  }

  res.json({ message: 'Application updated and candidate notified', application });
  await application.save();

    res.json({ message: 'Application updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.role === 'candidate') {
      // 1. CANDIDATE FEED: 
      // Show jobs matching their field AND prioritized by accessibility match
      const jobs = await Job.find({ field: user.field })
        .sort('-createdAt')
        .limit(20);

      return res.json({
        type: 'Candidate Feed',
        message: `Showing latest jobs in ${user.field}`,
        data: jobs
      });
    }

    if (user.role === 'employer') {
      // 2. EMPLOYER FEED (Dashboard):
      // Show their active listings, total applicant count, and recent notifications
      const myJobs = await Job.find({ postedBy: userId }).sort('-createdAt');
      
      // Get count of pending applications across all their jobs
      const applications = await Application.find({ 
        job: { $in: myJobs.map(j => j._id) },
        status: 'pending'
      }).populate('candidate', 'fullName field');

      return res.json({
        type: 'Employer Dashboard',
        message: `Welcome back, ${user.fullName}`,
        activeListings: myJobs.length,
        pendingApplications: applications.length,
        recentApplicants: applications.slice(0, 5), // Show top 5 newest
        data: myJobs
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};