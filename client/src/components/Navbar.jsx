import React, { useEffect, useState } from "react";
import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("light");

  // Load previously saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  // Switch theme
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10 transition-colors duration-300">
      <div className="flex justify-between items-center px-4 py-3">
        {/* Menu for mobile */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
          HRMS Dashboard
        </h1>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-gray-700" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </button>

          {/* Username */}
          <span className="text-gray-700 dark:text-gray-200 font-medium hidden sm:block">
            {user?.name || user?.email || "User"}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
