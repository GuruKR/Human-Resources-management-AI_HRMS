const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // 🧍 Existing fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, default: "Engineering" },
    position: { type: String, default: "Employee" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // 👇 New fields (kept safely)
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link to manager user account
    performanceRating: { type: Number, default: 0 }, // used for dashboard stats

    // 🧾 Additional employee profile details (for Profile Edit modal)
    phone: { type: String, default: "" },
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
    address: { type: String, default: "" }, // optional, future-proofing for profile extension

    // 📄 Documents (for uploads in profile section)
    documents: [
      {
        name: { type: String, required: true },
        filePath: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Virtual field or index setup (safe to add if other models depend on lookups)
employeeSchema.index({ email: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
