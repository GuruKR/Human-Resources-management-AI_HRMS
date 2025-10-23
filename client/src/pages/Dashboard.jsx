import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  LogOut,
  UserCircle2,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/dashboard/stats`);
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats?.total_employees || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Total Candidates",
      value: stats?.total_candidates || 0,
      icon: Briefcase,
      color: "from-teal-500 to-green-400",
    },
    {
      title: "Shortlisted",
      value: stats?.shortlisted_candidates || 0,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-400",
    },
    {
      title: "Pending Review",
      value: stats?.pending_review || 0,
      icon: Clock,
      color: "from-yellow-500 to-orange-400",
    },
    {
      title: "Upcoming Interviews",
      value: stats?.upcoming_interviews || 0,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-400",
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.full_name || "HR Professional"} 👋
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Stats Section */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-900 rounded-2xl shadow-md p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm text-gray-500 dark:text-gray-400">
                        {card.title}
                      </h3>
                      <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Candidates */}
          {stats?.recent_candidates?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 mt-10 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Candidates
              </h2>
              <div className="space-y-4">
                {stats.recent_candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="text-blue-500 dark:text-blue-400" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {candidate.full_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {candidate.position_applied}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        AI Score
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          candidate.ai_score >= 70
                            ? "text-green-600"
                            : candidate.ai_score >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {candidate.ai_score || "N/A"}
                      </p>
                      <span
                        className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          candidate.status === "shortlisted"
                            ? "bg-green-100 text-green-700"
                            : candidate.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
