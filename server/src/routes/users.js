const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// list users (Admin or Recruiter)
router.get('/', auth, requireRole('Admin','Recruiter'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// upload resume for a user (self or recruiter/admin)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/:id/resume', auth, upload.single('resume'), async (req, res) => {
  try {
    const { id } = req.params;
    // allow if user is owner or Admin/Recruiter
    if (req.user._id.toString() !== id && !['Admin','Recruiter'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(id, { resumeUrl: filePath }, { new: true }).select('-password');
    res.json({ user, filePath });
  } catch (err) { res.status(500).json({ msg: 'Upload error' }); }
});

module.exports = router;
