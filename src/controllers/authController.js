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
exports.deleteUser = async (req,res)=>{
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
exports.syncSupabaseUser = async (req, res) => {
  const { email, fullName, avatarUrl, providerId } = req.body;

  try {
    // 1. Find the user by email
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Create them if they are new
      user = await User.create({
        fullName,
        email,
        avatarUrl,
        providerId, // e.g., their GitHub or Google ID
        isVerified: true
      });
    }

    // 3. Return a JWT so they can use your protected routes
    res.status(200).json({
      _id: user._id,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Sync Supabase user with MongoDB
// @route   POST /api/auth/sync
exports.syncUser = async (req, res) => {
  const { email, fullName, googleId } = req.body;

  try {
    // Upsert: Find user by email or googleId, create if not found
    let user = await User.findOneAndUpdate(
      { $or: [{ email }, { googleId }] },
      { fullName, email, googleId, isVerified: true },
      { new: true, upsert: true }
    );

    // Return your own JWT for your Express protected routes
    const token = generateToken(user._id);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const handleGithubLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'http://localhost:3000/dashboard', 
    },
  });

  if (error) console.error("GitHub Login failed:", error.message);
};
exports.syncPhoneUser = async (req, res) => {
  const { phone, fullName } = req.body;

  try {
    let user = await User.findOneAndUpdate(
      { phone },
      { fullName, phone, isVerified: true },
      { new: true, upsert: true }
    );

    const token = generateToken(user._id);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/authController.js
exports.verifyEmployer = async (req, res) => {
  try {
    const { userId, status } = req.body;
    // Security: You'd typically add an isAdmin middleware here
    const user = await User.findByIdAndUpdate(userId, { verificationStatus: status }, { new: true });
    res.json({ message: `Employer status updated to ${status}`, user });
  } catch (err) {
    res.status(500).json(err);
  }
};