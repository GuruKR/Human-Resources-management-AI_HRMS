import React from "react";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import HRDashboard from "./HRDashboard";
import ManagerDashboard from "./ManagerDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "hr":
      return <HRDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    default:
      return (
        <div className="flex h-screen items-center justify-center text-gray-700">
          Unknown role: {user.role}
        </div>
      );
  }
}
