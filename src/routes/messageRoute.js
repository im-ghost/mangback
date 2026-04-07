const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { sendMessage, getInbox, getChatHistory } = require('../controllers/messageController');

router.get('/inbox', protect, getInbox);
router.get('/:partnerId', protect, getChatHistory);
router.post('/', protect, sendMessage);

module.exports = router;