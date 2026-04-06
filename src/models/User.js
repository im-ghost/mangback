const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String }, // Only for email/password users
  googleId: String,
  facebookId: String,
  twitterId: String,
  isVerified: { type: Boolean, default: false },
  otp: { code: String, expiresAt: Date }
});