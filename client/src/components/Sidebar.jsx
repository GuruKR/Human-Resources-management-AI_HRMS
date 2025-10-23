import React from "react";
import {
  Home,
  Users,
  Briefcase,
  ClipboardList,
  BrainCircuit,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Employees", icon: Users, path: "/employees" },
  { name: "Candidates", icon: ClipboardList, path: "/candidates" },
  { name: "Recruitment", icon: Briefcase, path: "/recruitment" },
  { name: "AI Interviews", icon: BrainCircuit, path: "/interviews" },
];

export default function Sidebar({ role, isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed lg:static z-30 inset-y-0 left-0 w-64
        bg-gradient-to-b from-blue-600 to-indigo-700
        dark:from-gray-900 dark:to-gray-800
        text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="p-5 text-2xl font-extrabold border-b border-blue-400 dark:border-gray-700 tracking-wide text-center">
          HR <span className="text-blue-200 dark:text-indigo-400">Genius</span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center space-x-3 px-3 py-2 rounded-md relative overflow-hidden
                  transition-all duration-200 ease-in-out ${
                    active
                      ? "bg-white text-blue-700 font-semibold dark:bg-gray-100 dark:text-gray-900"
                      : "hover:bg-blue-500/30 dark:hover:bg-gray-700/40"
                  }`}
                onClick={onClose}
              >
                {/* Glow effect behind active item */}
                {active && (
                  <span className="absolute inset-0 bg-white/20 blur-xl animate-pulse"></span>
                )}
                <Icon
                  className={`h-5 w-5 relative z-10 ${
                    active ? "text-blue-700 dark:text-indigo-400" : ""
                  }`}
                />
                <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-150">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
