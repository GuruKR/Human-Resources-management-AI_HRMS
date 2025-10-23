const express = require("express");
const Candidate = require("../models/Candidate");
const Employee = require("../models/Employee");
const Interview = require("../models/Interview");
const Attendance = require("../models/Attendance");
const Payroll = require("../models/Payroll");
const LeaveRequest = require("../models/LeaveRequest");

const router = express.Router();

/* ===========================
   1️⃣ HR Overview Stats
=========================== */
router.get("/stats", async (req, res) => {
  console.log("📊 [GET] /api/hr/stats called");
  try {
    const [
      totalCandidates,
      hiredCandidates,
      pendingInterviews,
      totalEmployees,
      pendingLeaves,
    ] = await Promise.all([
      Candidate.countDocuments().catch(() => 0),
      Candidate.countDocuments({ status: "hired" }).catch(() => 0),
      Interview.countDocuments({ status: "scheduled" }).catch(() => 0),
      Employee.countDocuments({ status: "active" }).catch(() => 0),
      LeaveRequest.countDocuments({ status: "pending" }).catch(() => 0),
    ]);

    res.json({
      totalCandidates,
      hiredThisMonth: hiredCandidates,
      pendingInterviews,
      totalEmployees,
      leaveRequests: pendingLeaves,
    });
  } catch (err) {
    console.error("❌ Error fetching HR stats:", err.message);
    res.status(500).json({ error: "Failed to fetch HR stats" });
  }
});

/* ===========================
   2️⃣ Recruitment Pipeline
=========================== */
router.get("/pipeline", async (req, res) => {
  console.log("📈 [GET] /api/hr/pipeline called");
  try {
    const statuses = ["pending", "hired", "rejected"];
    const pipeline = await Promise.all(
      statuses.map(async (s) => ({
        stage:
          s === "pending"
            ? "New Applications"
            : s.charAt(0).toUpperCase() + s.slice(1),
        count: await Candidate.countDocuments({ status: s }).catch(() => 0),
      }))
    );
    res.json(pipeline);
  } catch (err) {
    console.error("❌ Error fetching recruitment pipeline:", err.message);
    res.status(500).json({ error: "Failed to fetch pipeline" });
  }
});

/* ===========================
   3️⃣ Attendance Snapshot
=========================== */
router.get("/attendance", async (req, res) => {
  console.log("🕒 [GET] /api/hr/attendance called");
  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    })
      .populate("employee", "name")
      .catch(() => []);

    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;
    const onLeave = records
      .filter((r) => r.status === "On Leave")
      .map((r) => r.employee?.name || "Unknown");

    res.json({ present, absent, late, onLeave });
  } catch (err) {
    console.error("❌ Error fetching attendance:", err.message);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

/* ===========================
   4️⃣ Payroll Summary
=========================== */
router.get("/payroll", async (req, res) => {
  console.log("💰 [GET] /api/hr/payroll called");
  try {
    const totalPayrolls = await Payroll.countDocuments().catch(() => 0);
    const processedPayrolls = await Payroll.countDocuments({
      isProcessed: true,
    }).catch(() => 0);

    const totalExpenseData = await Payroll.aggregate([
      { $match: { isProcessed: true } },
      { $group: { _id: null, total: { $sum: "$netPay" } } },
    ]).catch(() => []);

    const total = totalExpenseData[0]?.total || 0;

    res.json({
      totalExpense: `₹${total.toLocaleString("en-IN")}`,
      salariesProcessed: `${processedPayrolls} / ${totalPayrolls}`,
    });
  } catch (err) {
    console.error("❌ Error fetching payroll summary:", err.message);
    res.status(500).json({ error: "Failed to fetch payroll summary" });
  }
});

/* ===========================
   5️⃣ Generate Payslips
=========================== */
router.post("/generate-payslips", async (req, res) => {
  console.log("🧾 [POST] /api/hr/generate-payslips called");
  try {
    const result = await Payroll.updateMany(
      { isProcessed: false },
      { $set: { isProcessed: true } }
    );
    res.json({
      message: "Payslips generated successfully!",
      updated: result.modifiedCount,
    });
  } catch (err) {
    console.error("❌ Error generating payslips:", err.message);
    res.status(500).json({ error: "Failed to generate payslips" });
  }
});

/* ===========================
   6️⃣ Additional Functional APIs
=========================== */

// ✅ Get All Candidates
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    console.error("❌ Error fetching candidates:", err.message);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// ✅ Get Hired Employees (this month)
router.get("/hired", async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    const employees = await Employee.find({
      createdAt: { $gte: start },
    });
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching hired employees:", err.message);
    res.status(500).json({ error: "Failed to fetch hired employees" });
  }
});

/* ===========================
   ✅ Fixed Pending Interviews Route
=========================== */
router.get("/interviews/pending", async (req, res) => {
  console.log("📅 [GET] /api/hr/interviews/pending called");
  try {
    const interviews = await Interview.find({ status: "scheduled" })
      .populate({
        path: "candidate",
        select: "name email",
        strictPopulate: false, // ✅ prevents crash if candidate ref missing
      })
      .lean()
      .catch((err) => {
        console.error("❗ Populate failed:", err.message);
        return [];
      });

    res.json(interviews || []);
  } catch (err) {
    console.error("❌ Error fetching interviews:", err.message);
    res
      .status(500)
      .json({ error: err.message || "Failed to fetch interviews" });
  }
});

// ✅ Update Interview Status
router.post("/interviews/update/:id", async (req, res) => {
  try {
    const { status } = req.body; // e.g. "cancelled" | "completed"
    await Interview.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Interview marked as ${status}` });
  } catch (err) {
    console.error("❌ Error updating interview:", err.message);
    res.status(500).json({ error: "Failed to update interview" });
  }
});

// ✅ Get All Employees
router.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    console.error("❌ Error fetching employees:", err.message);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// ✅ Get Leave Requests
router.get("/leaves", async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().populate("employee", "name email");
    res.json(leaves);
  } catch (err) {
    console.error("❌ Error fetching leave requests:", err.message);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
});

// ✅ Update Leave Request (approve/reject)
router.post("/leaves/:id/decision", async (req, res) => {
  try {
    const { decision } = req.body; // "approved" | "rejected"
    await LeaveRequest.findByIdAndUpdate(req.params.id, { status: decision });
    res.json({ message: `Leave ${decision} successfully` });
  } catch (err) {
    console.error("❌ Error updating leave request:", err.message);
    res.status(500).json({ error: "Failed to update leave request" });
  }
});

module.exports = router;
