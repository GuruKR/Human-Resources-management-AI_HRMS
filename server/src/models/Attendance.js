const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "On Leave"],
      default: "Present",
    },
    checkInTime: { type: String },
    checkOutTime: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
