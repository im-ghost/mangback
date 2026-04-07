const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadResume } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Configure Multer for PDF-only memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf files are allowed!'), false);
    }
  }
});

// The Route: Protect ensures only logged-in users can upload
router.post('/upload-resume', protect, upload.single('resume'), uploadResume);

module.exports = router;