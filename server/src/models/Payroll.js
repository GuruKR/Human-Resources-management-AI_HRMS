const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

    baseSalary: { type: Number, required: true, default: 0 },  // Monthly base salary
    bonuses: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },

    month: { type: String, required: true },  // e.g. "October 2025"
    paymentDate: { type: Date, default: Date.now },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    remarks: String,
  },
  { timestamps: true }
);

// Auto-calculate net pay before saving
payrollSchema.pre("save", function (next) {
  this.netPay = this.baseSalary + this.bonuses - this.deductions;
  next();
});

module.exports = mongoose.model("Payroll", payrollSchema);
