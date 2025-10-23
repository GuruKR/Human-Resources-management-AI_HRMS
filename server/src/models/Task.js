const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  deadline: Date,
  priority: String,
  createdBy: String,
  status: { type: String, default: "Pending" },
});

module.exports = mongoose.model("Task", taskSchema);
