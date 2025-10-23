require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");

// ===== Route Imports =====
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const employeeRoutes = require("./routes/employees");
const candidateRoutes = require("./routes/candidates");
const interviewRoutes = require("./routes/interviews");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const hrDashboardRoutes = require("./routes/hrDashboard");
const aiRoutes = require("./routes/aiRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const taskRoutes = require("./routes/taskRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const managerRoutes = require("./routes/managerRoutes");

// ✅ Import only once (socket server)
const createInterviewSocket = require("./routes/aiLiveSocket");

// ===== Express App Setup =====
const app = express();
const server = http.createServer(app); // ✅ Use this for Socket.IO

// ===== Middlewares =====
app.use(cors());
app.use(express.json());

// ✅ Static file setup
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      }
    },
  })
);

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hr", hrDashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/manager", managerRoutes);

// ===== Root Route =====
app.get("/", (req, res) => {
  res.send("✅ HRMS API is running...");
});

// ===== MongoDB + Socket.IO Startup =====
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // ✅ Attach Socket.IO server
    createInterviewSocket(server);
    console.log("🟢 Socket.IO server for Live AI Interviews started");

    // ✅ Start both servers together
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
