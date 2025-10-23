const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Department = require("../models/Department");

// ============================
// 📊 1. Dashboard Stats
// ============================
router.get("/stats", async (req, res) => {
  try {
    const total_employees = await User.countDocuments({ role: "employee" });
    const total_managers = await User.countDocuments({ role: "manager" });
    const total_hr = await User.countDocuments({ role: "hr" });
    const total_candidates = await Candidate.countDocuments();
    const total_departments = await Department.countDocuments();
    const pending_approvals = await Candidate.countDocuments({ status: "pending" });

    res.json({
      total_employees,
      total_managers,
      total_hr,
      total_candidates,
      total_departments,
      pending_approvals,
    });
  } catch (err) {
    console.error("Error in /admin/stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ============================
// 👥 2. User Management
// ============================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "full_name name email role department active");
    res.json(users);
  } catch (err) {
    console.error("Error in /admin/users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ============================
// 🏢 3. Department List
// ============================
router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find({}, "name");
    res.json(departments);
  } catch (err) {
    console.error("Error in /admin/departments:", err);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

// ============================
// 🕒 4. Recent Activities
// ============================
router.get("/activities", async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const activities = recentUsers.map((u) => ({
      description: `${u.name || u.full_name} (${u.role}) joined ${
        u.department || "the company"
      }`,
      timestamp: u.createdAt,
    }));
    res.json(activities);
  } catch (err) {
    console.error("Error in /admin/activities:", err);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
});

// ============================
// 📈 5. Department Employee Count
// ============================
router.get("/department-analytics", async (req, res) => {
  try {
    const data = await User.aggregate([
      { $match: { role: "employee" } },
      { $group: { _id: "$department", employees: { $sum: 1 } } },
      { $project: { _id: 0, department: "$_id", employees: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    console.error("Error in /admin/department-analytics:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// ============================
// 📈 6. Hiring Trend
// ============================
router.get("/hiring-trend", async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Candidate.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          hires: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Jan" },
                { case: { $eq: ["$_id", 2] }, then: "Feb" },
                { case: { $eq: ["$_id", 3] }, then: "Mar" },
                { case: { $eq: ["$_id", 4] }, then: "Apr" },
                { case: { $eq: ["$_id", 5] }, then: "May" },
                { case: { $eq: ["$_id", 6] }, then: "Jun" },
                { case: { $eq: ["$_id", 7] }, then: "Jul" },
                { case: { $eq: ["$_id", 8] }, then: "Aug" },
                { case: { $eq: ["$_id", 9] }, then: "Sep" },
                { case: { $eq: ["$_id", 10] }, then: "Oct" },
                { case: { $eq: ["$_id", 11] }, then: "Nov" },
                { case: { $eq: ["$_id", 12] }, then: "Dec" },
              ],
              default: "Unknown",
            },
          },
          hires: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("Error in /admin/hiring-trend:", err);
    res.status(500).json({ message: "Failed to fetch trend data" });
  }
});

// ============================
// ➕ Add Department
// ============================
router.post("/add-department", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Department name required" });

    const exists = await Department.findOne({ name });
    if (exists) return res.status(400).json({ message: "Department already exists" });

    const department = new Department({ name });
    await department.save();

    res.json({ message: "Department added successfully", department });
  } catch (err) {
    console.error("Error in /admin/add-department:", err);
    res.status(500).json({ message: "Failed to add department" });
  }
});

// ============================
// 🗓️ Set Default Leave Policy
// ============================
router.post("/set-leave-policy", async (req, res) => {
  try {
    const { days } = req.body;
    if (!days || days < 0)
      return res.status(400).json({ message: "Invalid number of days" });

    const Config = require("../models/Config");


    const config = await Config.findOneAndUpdate(
      {},
      { leaveDays: days, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: `Leave policy set to ${days} days`, config });
  } catch (err) {
    console.error("Error in /admin/set-leave-policy:", err);
    res.status(500).json({ message: "Failed to set policy" });
  }
});

// ============================
// 👑 Promote to Admin
// ============================
router.post("/promote-admin", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ message: `${email} promoted to admin`, user });
  } catch (err) {
    console.error("Error in /admin/promote-admin:", err);
    res.status(500).json({ message: "Failed to promote user" });
  }
});

module.exports = router;
