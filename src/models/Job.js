const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true }, // e.g., "Lagos (Remote)"
  description: { type: String, required: true },
  salaryRange: String,
  
  // Link to the Employer who posted the job 
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Links this job to the Employer who created it
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);