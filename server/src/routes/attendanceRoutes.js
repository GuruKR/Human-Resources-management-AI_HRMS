const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// 📅 Get all attendance records of an employee
router.get("/:id", async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.params.id });

    if (!records || records.length === 0) {
      return res.json({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        onLeaveDays: 0,
        status: "No Records",
      });
    }

    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const absentDays = records.filter(r => r.status === "Absent").length;
    const lateDays = records.filter(r => r.status === "Late").length;
    const onLeaveDays = records.filter(r => r.status === "On Leave").length;

    const latestRecord = records[records.length - 1];

    res.json({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      onLeaveDays,
      status: latestRecord?.status || "N/A",
      checkInTime: latestRecord?.checkInTime || null,
      checkOutTime: latestRecord?.checkOutTime || null,
    });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Server error fetching attendance data" });
  }
});

// 🕒 POST route for marking attendance
router.post("/mark", async (req, res) => {
  try {
    const { employeeId, status, checkInTime, checkOutTime } = req.body;

    if (!employeeId) return res.status(400).json({ error: "Employee ID required" });

    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if attendance already exists for today
    const existing = await Attendance.findOne({ employee: employeeId, date: { $gte: dateOnly } });

    if (existing)
      return res.status(400).json({ message: "Attendance already marked for today" });

    const attendance = new Attendance({
      employee: employeeId,
      date: today,
      status: status || "Present",
      checkInTime,
      checkOutTime,
    });

    await attendance.save();
    res.json({ message: "Attendance marked successfully", attendance });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ error: "Server error marking attendance" });
  }
});

module.exports = router;
