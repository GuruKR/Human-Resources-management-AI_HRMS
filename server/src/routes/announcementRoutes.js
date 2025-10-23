const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");

router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Server error in announcements" });
  }
});

module.exports = router;
