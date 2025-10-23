const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee"); // ✅ Added to auto-sync employee data
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// 🔹 Register new user
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, role, department, phone, gender } = req.body;

    // ✅ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already registered" });

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create user
    const user = new User({
      full_name,
      email,
      password: hashedPassword,
      role,
      department,
      phone,
      gender,
    });

    await user.save();

    /* ======================================================
       🧩 AUTO-CREATE EMPLOYEE PROFILE (if role = "employee")
    ====================================================== */
    if (role === "employee") {
      try {
        const employee = new Employee({
          _id: user._id, // ✅ keep both user & employee in sync
          name: full_name,
          email,
          department,
          position: "Employee",
          status: "active",
          managerId: null,
          performanceRating: 0,
          documents: [],
        });
        await employee.save();
        console.log(`✅ Employee profile created for ${full_name}`);
      } catch (err) {
        console.error("⚠️ Error creating employee profile:", err);
      }
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      msg: "Registration successful",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ msg: "Server error during registration" });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// 🔹 Forgot Password — Send reset link
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ msg: "User with this email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HRMS Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - HRMS",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click below to reset your password (valid for 15 mins):</p>
        <a href="${resetURL}" 
           style="background-color:#007bff;color:#fff;
                  padding:10px 15px;text-decoration:none;
                  border-radius:6px;display:inline-block;">
           Reset Password
        </a>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Password reset link sent to your email!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ msg: "Error sending reset email" });
  }
});

// 🔹 Reset Password — Verify token and update password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ msg: "Invalid or expired reset token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ msg: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ msg: "Server error resetting password" });
  }
});

module.exports = router;
