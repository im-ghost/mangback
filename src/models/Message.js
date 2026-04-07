const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isAccommodationRequest: { type: Boolean, default: false }, // "Top-Notch" Flag
  jobContext: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' } // Link to the specific job
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);