const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUser, deleteUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/:id', protect, deleteUser);
router.put('/:id', protect, updateUser);

//router.post('/send-otp', sendOTP);
//router.post('/verify-otp', verifyOTP);

module.exports = router;