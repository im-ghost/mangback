const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // For calling the Termii SMS API

// @desc    Register a new user (Email/Password)
exports.registerUser = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user (Email/Password)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // Compare the entered password with the hashed password in the DB
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateUser = async (req, res) =>{
  const { email } = req.body;
  try{
    const user = await User.findOne({ email });
    if(user){
        const updatedUser = await User.findByIdAndUpdate(
                 req.params.id,
                 req.body,
                 { new: true, runValidators: true }
               );
           
               res.json(updatedUser);
    } else{
      res.status(401).json({ message: 'Invalid email' });
    }
  }catch(error){
    res.status(error.status).json({message: error.message})
  }
}
exports.deleteUser = async (req,res){
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    // Compare the entered password with the hashed password in the DB
    if (user && (await bcrypt.compare(password, user.password))) {
      await user.deleteOne();
      res.json({message : " Deleted"})
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// @desc    Send OTP to Phone (Using Termii for Nigeria)
/**exports.sendOTP = async (req, res) => {
  const { phone } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  try {
    // 1. Find or create user by phone
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, fullName: "New User" });

    // 2. Save OTP and Expiry to DB
    user.otp = { code: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 mins
    await user.save();

    // 3. Trigger Termii API (Nigerian SMS Gateway)
    await axios.post('https://api.ng.termii.com/api/sms/send', {
      to: phone,
      from: "N-ALERT",
      sms: `Your JobApp verification code is: ${otpCode}`,
      type: "plain",
      channel: "dnd", // 'dnd' ensures it bypasses DND restrictions in Nigeria
      api_key: process.env.TERMII_API_KEY,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, code } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user || user.otp.code !== code || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp.code = undefined; // Clear code after use
    await user.save();

    res.json({
      _id: user._id,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};**/