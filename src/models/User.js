const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Sparse allows null for phone-only users
  phone: { type: String, unique: true, sparse: true },
  password: { type: String }, // Optional if only using Social/OTP
  
  // Auth Providers
  googleId: String,
  facebookId: String,
  
  resumeUrl: { type: String, default: "" },
  
  // Verification for OTP
  isVerified: { type: Boolean, default: false },
  otp: {
    code: String,
    expiresAt: Date
  },
  // Add these to your existing userSchema
verificationStatus: {
  type: String,
  enum: ['unverified', 'pending', 'verified', 'rejected'],
  default: 'unverified'
},
cacDocumentUrl: { type: String }, // Link to their CAC PDF on Supabase
isInclusiveCertified: { type: Boolean, default: false }
  // Add to userSchema
,field: {
  type: String,
  required: true,
  enum: ['Legal Services', 'Information Technology', 'Healthcare', 'Education', 'Finance', 'Engineering', 'Public Sector', 'Others']
},
  role: { type: String, enum: ['candidate', 'employer'], default: 'candidate' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);