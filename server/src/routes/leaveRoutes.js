const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");

// 🧩 GET all leave records of a specific employee
router.get("/:id", async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.id });

    if (!leaves || leaves.length === 0) {
      return res.json({
        approved: 0,
        pending: 0,
        rejected: 0,
        remaining: 12, // Example default annual quota
        allLeaves: [],
      });
    }

    const approved = leaves.filter(l => l.status === "approved").length;
    const pending = leaves.filter(l => l.status === "pending").length;
    const rejected = leaves.filter(l => l.status === "rejected").length;
    const remaining = 12 - approved; // You can change 12 → dynamic based on policy

    res.json({ approved, pending, rejected, remaining, allLeaves: leaves });
  } catch (err) {
    console.error("Error fetching leaves:", err);
    res.status(500).json({ error: "Server error while fetching leaves" });
  }
});

// 📝 POST apply for leave
router.post("/apply", async (req, res) => {
  try {
    const { employeeId, from, to, reason } = req.body;

    if (!employeeId || !from || !to) {
      return res.status(400).json({ error: "Employee ID, from, and to dates are required" });
    }

    const newLeave = new Leave({
      employeeId,
      from,
      to,
      reason,
      status: "pending",
    });

    await newLeave.save();
    res.json({ message: "Leave application submitted successfully", leave: newLeave });
  } catch (err) {
    console.error("Error applying leave:", err);
    res.status(500).json({ error: "Server error while applying leave" });
  }
});

// 🟢 PATCH update leave status (for HR/Manager)
router.patch("/update/:leaveId", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.leaveId,
      { status },
      { new: true }
    );

    if (!leave) return res.status(404).json({ error: "Leave not found" });

    res.json({ message: `Leave ${status} successfully`, leave });
  } catch (err) {
    console.error("Error updating leave:", err);
    res.status(500).json({ error: "Server error while updating leave status" });
  }
});

module.exports = router;
