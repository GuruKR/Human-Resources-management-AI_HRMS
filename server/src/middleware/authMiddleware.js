const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware to verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ msg: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// ✅ Middleware for role-based authorization
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Access denied: ${req.user.role} is not authorized to perform this action.`,
      });
    }
    next();
  };
};
