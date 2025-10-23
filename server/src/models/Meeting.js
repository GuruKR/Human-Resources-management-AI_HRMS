const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    datetime: { type: Date, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
