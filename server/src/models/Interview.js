const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  interviewer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  interview_type: { type: String, enum: ['ai_chat', 'manual'], default: 'ai_chat' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  conversation_history: [
    {
      role: { type: String, enum: ['interviewer', 'candidate'], required: true },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
