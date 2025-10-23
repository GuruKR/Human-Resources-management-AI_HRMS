const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const multer = require('multer');
const upload = multer();

router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ created_at: -1 });
    res.json(candidates);
  } catch {
    res.status(500).json({ msg: 'Failed to load candidates' });
  }
});

router.post('/', upload.single('resume_file'), async (req, res) => {
  try {
    const { full_name, email, phone, position_applied } = req.body;
    const resume_text = req.file ? req.file.buffer.toString('utf-8') : "";

    // simple mock AI analysis
    const ai_score = Math.floor(Math.random() * 50) + 50;
    const candidate = await Candidate.create({
      full_name, email, phone, position_applied, resume_text,
      ai_score,
      ai_analysis: {
        summary: "Strong experience with moderate skill alignment.",
        strengths: ["Good communication", "Team player"],
        concerns: ["Needs more technical depth"],
        recommendation: ai_score > 65 ? "shortlist" : "reject"
      },
      status: ai_score > 65 ? "shortlisted" : "rejected"
    });

    res.json({ candidate });
  } catch {
    res.status(500).json({ msg: 'Failed to analyze resume' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Candidate.findByIdAndUpdate(id, { status });
    res.json({ msg: 'Status updated' });
  } catch {
    res.status(500).json({ msg: 'Failed to update status' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    res.json(candidate);
  } catch {
    res.status(404).json({ msg: 'Candidate not found' });
  }
});

module.exports = router;
