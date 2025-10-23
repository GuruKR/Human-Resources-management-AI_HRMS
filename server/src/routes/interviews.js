const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');

// Get all interviews
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find().populate('candidate_id');
    const formatted = interviews.map(i => ({
      id: i._id,
      candidate_name: i.candidate_id?.full_name,
      position_applied: i.candidate_id?.position_applied,
      date: i.date,
      status: i.status
    }));
    res.json(formatted);
  } catch {
    res.status(500).json({ msg: 'Failed to load interviews' });
  }
});

// Create new interview
router.post('/', async (req, res) => {
  try {
    const interview = await Interview.create(req.body);
    res.json(interview);
  } catch {
    res.status(500).json({ msg: 'Failed to create interview' });
  }
});

// Get one interview
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    res.json(interview);
  } catch {
    res.status(404).json({ msg: 'Interview not found' });
  }
});

// AI chat handler (mock)
router.post('/:id/chat', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    const userMessage = { role: 'candidate', content: req.body.message, timestamp: new Date() };
    interview.conversation_history.push(userMessage);

    // simple AI mock reply
    const aiReply = { role: 'interviewer', content: "Interesting. Can you elaborate more?", timestamp: new Date() };
    interview.conversation_history.push(aiReply);

    await interview.save();
    res.json({
      message: aiReply.content,
      conversation_history: interview.conversation_history
    });
  } catch {
    res.status(500).json({ msg: 'Failed to process chat' });
  }
});

module.exports = router;
