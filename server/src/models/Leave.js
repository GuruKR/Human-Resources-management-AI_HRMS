const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  from: Date,
  to: Date,
  reason: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
});

module.exports = mongoose.model("Leave", leaveSchema);
