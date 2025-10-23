const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Task = require("../models/Task");
const Meeting = require("../models/Meeting"); // optional if you have meetings

// GET manager dashboard data
router.get("/team/:managerId", async (req, res) => {
  try {
    const { managerId } = req.params;
    const team = await Employee.find({ managerId });

    // compute stats
    const total = team.length;
    const onLeave = await Leave.countDocuments({
      employeeId: { $in: team.map((t) => t._id) },
      status: "approved",
      from: { $lte: new Date() },
      to: { $gte: new Date() },
    });

    const avgRating =
      team.reduce((acc, emp) => acc + (emp.performanceRating || 0), 0) /
      (total || 1);

    res.json({ team, stats: { total, onLeave, avgRating: avgRating.toFixed(2) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch team data" });
  }
});

// GET pending leaves for manager’s team
router.get("/leaves/:managerId", async (req, res) => {
  try {
    const { managerId } = req.params;
    const team = await Employee.find({ managerId });
    const pendingLeaves = await Leave.find({
      employeeId: { $in: team.map((t) => t._id) },
      status: "pending",
    }).populate("employeeId", "full_name role");
    res.json(pendingLeaves);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending leaves" });
  }
});

// Approve or Reject Leave
router.post("/leaves/:leaveId/:action", async (req, res) => {
  try {
    const { leaveId, action } = req.params;
    const status = action === "approve" ? "approved" : "rejected";
    await Leave.findByIdAndUpdate(leaveId, { status });
    res.json({ success: true, message: `Leave ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update leave" });
  }
});

// Tasks
router.get("/tasks/:managerId", async (req, res) => {
  try {
    const { managerId } = req.params;
    const tasks = await Task.find({ createdBy: managerId }).populate("assigneeId", "full_name role");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const { title, assigneeId, deadline, priority, createdBy } = req.body;
    const newTask = await Task.create({ title, assigneeId, deadline, priority, createdBy, status: "Pending" });
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Meetings (optional)
router.get("/meetings/:managerId", async (req, res) => {
  try {
    const { managerId } = req.params;
    const meetings = await Meeting.find({ managerId });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});

module.exports = router;
