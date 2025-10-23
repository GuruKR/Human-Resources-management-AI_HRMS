const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, default: 0 },
  lastReview: { type: Date, default: Date.now },
  remarks: String,
});

module.exports = mongoose.model("Performance", performanceSchema);
