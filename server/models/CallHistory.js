const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
  callerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['completed', 'missed', 'rejected'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CallHistory', callHistorySchema);
