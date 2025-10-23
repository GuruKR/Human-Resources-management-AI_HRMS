const express = require("express");
const router = express.Router();
const Payroll = require("../models/Payroll");

/* ---------------------------------------------
   💰 GET all payroll records of an employee
--------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.params.id })
      .sort({ paymentDate: -1 });

    if (!payrolls.length) {
      return res.json({
        latest: { baseSalary: 0, netPay: 0, paymentStatus: "Pending" },
        payrolls: [],
      });
    }

    const latest = payrolls[0];
    res.json({ latest, payrolls });
  } catch (err) {
    console.error("Error fetching payroll:", err);
    res.status(500).json({ error: "Server error fetching payroll data" });
  }
});

/* ---------------------------------------------
   🧾 POST create new payroll entry (HR/Admin)
--------------------------------------------- */
router.post("/create", async (req, res) => {
  try {
    const { employeeId, baseSalary, bonuses, deductions, month, remarks } = req.body;

    if (!employeeId || !baseSalary || !month) {
      return res.status(400).json({ error: "Employee ID, base salary, and month are required" });
    }

    const newPayroll = new Payroll({
      employeeId,
      baseSalary,
      bonuses,
      deductions,
      month,
      remarks,
    });

    await newPayroll.save();
    res.json({ message: "Payroll record created successfully", payroll: newPayroll });
  } catch (err) {
    console.error("Error creating payroll:", err);
    res.status(500).json({ error: "Server error while creating payroll record" });
  }
});

/* ---------------------------------------------
   💸 PATCH mark payroll as paid
--------------------------------------------- */
router.patch("/pay/:payrollId", async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.payrollId,
      { paymentStatus: "Paid", paymentDate: new Date() },
      { new: true }
    );

    if (!payroll) return res.status(404).json({ error: "Payroll not found" });

    res.json({ message: "Payroll marked as paid", payroll });
  } catch (err) {
    console.error("Error updating payroll:", err);
    res.status(500).json({ error: "Server error updating payroll" });
  }
});

module.exports = router;
