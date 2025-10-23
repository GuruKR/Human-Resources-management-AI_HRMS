import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import HRSidebar from "./HRSidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-[#f4f5f7] text-gray-800 relative z-0 overflow-visible">
      {/* Sidebar */}
      {user.role === "hr" ? (
        <HRSidebar />
      ) : (
        <Sidebar
          role={user.role}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-0">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Make the main area not clip the modals */}
        <main
          className="flex-1 p-6 bg-[#f9fafb] relative"
          style={{
            overflow: "visible",
            zIndex: 1, // 🔥 bring main content above sidebar
          }}
        > 
          <div id="modal-root" className="relative z-[99999]"></div> {/* 🔹 Portal anchor */}
          {children}
        </main>

      </div>
    </div>
  );
}
