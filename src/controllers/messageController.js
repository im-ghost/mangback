// @desc    Get all users I have a conversation with
// @route   GET /api/messages/inbox
exports.getInbox = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unique users I've sent messages to or received messages from
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort('-createdAt')
    .populate('sender', 'fullName avatarUrl')
    .populate('receiver', 'fullName avatarUrl');

    // Filter unique conversations
    const conversationPartners = new Map();

    messages.forEach(msg => {
      const partner = msg.sender._id.toString() === userId 
        ? msg.receiver 
        : msg.sender;
      
      if (!conversationPartners.has(partner._id.toString())) {
        conversationPartners.set(partner._id.toString(), {
          user: partner,
          lastMessage: msg.content,
          time: msg.createdAt
        });
      }
    });

    res.json(Array.from(conversationPartners.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// @route   GET /api/messages/:partnerId
exports.getChatHistory = async (req, res) => {
  try {
    const chat = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.partnerId },
        { sender: req.params.partnerId, receiver: req.user.id }
      ]
    }).sort('createdAt');

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};