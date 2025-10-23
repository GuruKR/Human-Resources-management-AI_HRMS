import React from "react";
import "./index.css"; 
import { ThemeProvider } from "./context/ThemeContext";
//import { AuthProvider } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import HRDashboard from "./pages/Dashboard/HRDashboard";
import ManagerDashboard from "./pages/Dashboard/ManagerDashboard";
import EmployeeDashboard from "./pages/Dashboard/EmployeeDashboard";
import Employees from "./pages/Employees";
import Candidates from "./pages/Candidates";
import Recruitment from "./pages/Recruitment";
import AIInterview from "./pages/AIInterview";
import AIResumeScreening from "./pages/AIResumeScreening";
import AllInterviews from "./pages/AllInterviews";
import AIVideoInterviewLive from "./pages/AIVideoInterviewLive"; // or correct component



// Quick Action Pages
import AddEmployee from "./pages/QuickActions/AddEmployee";
import UploadPayslips from "./pages/QuickActions/UploadPayslips";
import ScheduleInterview from "./pages/QuickActions/ScheduleInterview";

// ✅ Newly added pages for password recovery
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


// 🔒 Protected Route Wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}

// 🎨 Optional page styling for login vs app pages
function PageWrapper({ children }) {
  const location = useLocation();
  const isLoginPage =
    location.pathname === "/" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password");

  return (
    <div
      className={
        isLoginPage
          ? "min-h-screen flex items-center justify-center bg-gray-50" // ✅ light neutral background
          : "min-h-screen w-full bg-gray-50"
      }
    >
      {children}
    </div>
  );
}


// 🧩 App routes
function AppRoutes() {
  return (
    <Router>
      <PageWrapper>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          


          {/* Role-Based Dashboards */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Common Pages */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <Candidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruitment"
            element={
              <ProtectedRoute>
                <Recruitment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/:interviewId"
            element={
              <ProtectedRoute>
                <AIInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews"
            element={
              <ProtectedRoute>
                <AllInterviews />
              </ProtectedRoute>
            }
          />

          {/* 🚀 Quick Actions (HR Only) */}
          <Route
            path="/employees/add"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <AddEmployee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/upload"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <UploadPayslips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviews/schedule"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <ScheduleInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-resume-screening"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <AIResumeScreening />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-interview"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <AIInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-voice-interview"
            element={
              <ProtectedRoute allowedRoles={["hr", "manager"]}>
                <AIVideoInterviewLive />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-video-interview"
            element={
              <ProtectedRoute allowedRoles={["hr", "manager"]}>
                <AIVideoInterviewLive />
              </ProtectedRoute>
            }
          />


        </Routes>
      </PageWrapper>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
