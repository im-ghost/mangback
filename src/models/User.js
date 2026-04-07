const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Sparse allows null for phone-only users
  phone: { type: String, unique: true, sparse: true },
  password: { type: String }, // Optional if only using Social/OTP
  
  // Auth Providers
  googleId: String,
  facebookId: String,
  
  // The Cloud URL we talked about
  resumeUrl: { type: String, default: "" },
  
  // Verification for OTP
  isVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date
  },
  
  role: { type: String, enum: ['candidate', 'employer'], default: 'candidate' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);