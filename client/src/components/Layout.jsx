import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Layout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-600">HR Genius</h1>

          <div className="flex items-center space-x-4">
            <p className="text-gray-700">
              {user?.full_name || user?.email || "Guest"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                onLogout?.();
                toast.success("Logged out successfully!");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
