const User = require('../models/User');

// Get all employers waiting for verification
exports.getPendingEmployers = async (req, res) => {
  try {
    const pending = await User.find({ 
      role: 'employer', 
      verificationStatus: 'pending' 
    }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve or Reject an Employer
exports.updateEmployerStatus = async (req, res) => {
  try {
    const { userId, status } = req.body; // status: 'verified' or 'rejected'
    const user = await User.findByIdAndUpdate(
      userId, 
      { verificationStatus: status }, 
      { new: true }
    );
    res.json({ message: `Employer is now ${status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};