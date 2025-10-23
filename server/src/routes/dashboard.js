const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// 🟢 Admin-only route
router.get("/admin", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ msg: `Welcome Admin, ${req.user.full_name}` });
});

// 🟣 HR-only route
router.get("/hr", verifyToken, authorizeRoles("hr"), (req, res) => {
  res.json({ msg: `Welcome HR, ${req.user.full_name}` });
});

// 🔵 Manager or HR can access this
router.get("/reports", verifyToken, authorizeRoles("hr", "manager"), (req, res) => {
  res.json({ msg: `Report Access Granted to ${req.user.role}` });
});

// 🟠 Any authenticated user can access this
router.get("/profile", verifyToken, (req, res) => {
  res.json({ msg: `Hello ${req.user.full_name}`, user: req.user });
});

module.exports = router;
