const express = require("express");
const router = express.Router();
const Performance = require("../models/Performance");

router.get("/:id", async (req, res) => {
  try {
    const perf = await Performance.findOne({ employeeId: req.params.id });
    res.json(perf || { rating: "N/A", lastReview: "N/A" });
  } catch (err) {
    res.status(500).json({ error: "Server error in performance" });
  }
});

module.exports = router;
