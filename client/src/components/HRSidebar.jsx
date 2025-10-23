import React from "react";
import { Users, FileText, CalendarDays, Brain } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const hrNavItems = [
  { name: "Dashboard", icon: Brain, path: "/dashboard" },
  { name: "Candidates", icon: Users, path: "/candidates" },
  { name: "Interview Schedule", icon: CalendarDays, path: "/interviews" },
  { name: "Reports", icon: FileText, path: "/recruitment" },
];

export default function HRSidebar() {
  const location = useLocation();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 bg-gradient-to-b
      from-teal-600 to-green-700 dark:from-gray-900 dark:to-gray-800
      text-white shadow-lg transition-all duration-300 ease-in-out"
    >
      {/* Header */}
      <div className="p-5 text-2xl font-extrabold border-b border-teal-400 dark:border-gray-700 tracking-wide text-center">
        HR <span className="text-green-200 dark:text-teal-300">Panel</span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {hrNavItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center space-x-3 px-3 py-2 rounded-md relative overflow-hidden
                transition-all duration-200 ease-in-out ${
                  active
                    ? "bg-white text-teal-700 font-semibold dark:bg-gray-100 dark:text-gray-900"
                    : "hover:bg-teal-500/30 dark:hover:bg-gray-700/40"
                }`}
            >
              {active && (
                <span className="absolute inset-0 bg-white/20 blur-xl animate-pulse"></span>
              )}
              <Icon
                className={`h-5 w-5 relative z-10 ${
                  active ? "text-teal-700 dark:text-teal-400" : ""
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
  );
}
