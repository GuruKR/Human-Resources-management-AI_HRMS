// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  Building2,
  UserCog,
  Settings,
  Activity,
  UserPlus,
  X,
  Bell,
  Search,
  Menu
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [deptAnalytics, setDeptAnalytics] = useState([]);
  const [hiringTrend, setHiringTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddDept, setShowAddDept] = useState(false);
  const [showLeavePolicy, setShowLeavePolicy] = useState(false);
  const [showManageAdmin, setShowManageAdmin] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);
  const [showManagers, setShowManagers] = useState(false);
  const [showHR, setShowHR] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Form Data
  const [newDept, setNewDept] = useState("");
  const [leaveDays, setLeaveDays] = useState(12);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, deptRes, actRes, deptAnalyticsRes, trendRes] =
        await Promise.all([
          axios.get(`${API}/admin/stats`),
          axios.get(`${API}/admin/users`),
          axios.get(`${API}/admin/departments`),
          axios.get(`${API}/admin/activities`),
          axios.get(`${API}/admin/department-analytics`),
          axios.get(`${API}/admin/hiring-trend`),
        ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDepartments(deptRes.data);
      setActivities(actRes.data);
      setDeptAnalytics(deptAnalyticsRes.data);
      setHiringTrend(trendRes.data);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Add Department
  const handleAddDepartment = async () => {
    if (!newDept.trim()) return toast.error("Enter a department name!");
    try {
      const res = await axios.post(`${API}/admin/add-department`, { name: newDept });
      toast.success(res.data.message || `✅ Department "${newDept}" added successfully!`);
      setShowAddDept(false);
      setNewDept("");
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add department");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Set Leave Policy
  const handleSetLeavePolicy = async () => {
    if (!leaveDays || leaveDays < 1) return toast.error("Enter a valid number!");
    try {
      const res = await axios.post(`${API}/admin/set-leave-policy`, { days: leaveDays });
      toast.success(res.data.message || `✅ Leave policy set to ${leaveDays} days`);
      setShowLeavePolicy(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to set policy");
    }
  };

  // Promote Admin
  const handleManageAdmin = async () => {
    if (!adminEmail.trim()) return toast.error("Enter an admin email");
    try {
      const res = await axios.post(`${API}/admin/promote-admin`, { email: adminEmail });
      toast.success(res.data.message || `👑 ${adminEmail} promoted to Admin`);
      setAdminEmail("");
      setShowManageAdmin(false);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote user");
    }
  };

  /* -----------------------
     Layout Components
     ----------------------- */

  // Left Sidebar (simple)
  const Sidebar = ({ onToggle }) => {
    return (
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen hidden lg:flex flex-col transition-colors duration-300">
        <div className="px-6 py-6 flex items-center gap-3 border-b">
          <div className="bg-indigo-600 text-white font-bold rounded-md w-9 h-9 flex items-center justify-center">A</div>
          <div>
            <div className="font-semibold text-gray-800">AtrioHR</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-4">
            <img src={`https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff`} alt="avatar" className="w-12 h-12 rounded-lg object-cover" />
            <div>
              <div className="font-semibold text-gray-800">Admin Name</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="px-4 mt-2 flex-1">
          <ul className="space-y-1">
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3">
              <Users className="w-4 h-4" /> <span>Dashboard</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3">
              <Briefcase className="w-4 h-4" /> <span>Employees</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3">
              <UserPlus className="w-4 h-4" /> <span>Candidates</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3">
              <Building2 className="w-4 h-4" /> <span>Departments</span>
            </li>
            <li className="px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-3">
              <Settings className="w-4 h-4" /> <span>Settings</span>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              setShowManageAdmin(true);
            }}
            className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm"
          >
            Manage Admins
          </button>
        </div>
      </aside>
    );
  };

  // Top Navbar
  const Topbar = ({ onToggle }) => {
    return (
      <header className="w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-3 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-md bg-gray-100" onClick={onToggle}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
            <p className="text-sm text-gray-500">Overview of HR activity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <Search className="w-4 h-4 text-gray-500" />
            <input placeholder="Search..." className="bg-transparent outline-none text-sm" />
          </div>

          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <X className="w-4 h-4" /> Logout
          </button>

          <img
            src={`https://ui-avatars.com/api/?name=Admin&background=ffb020&color=fff`}
            alt="user"
            className="w-9 h-9 rounded-full"
          />
        </div>

      </header>
    );
  };

  /* ---------- Presentational / Small Components ---------- */

  const OverviewCard = ({ title, value, icon, gradient }) => (
    <div className={`rounded-xl p-5 text-white shadow-lg transform hover:-translate-y-1 transition ${gradient}`}>
      <div className="flex items-start justify-between">
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  );

  const StatCard = ({ icon, title, value, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white border-gray-200 p-6 rounded-lg"
    >
      <div className="text-indigo-600 mb-3">{icon}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-2">{value}</div>
    </div>
  );

  const AnalyticsSection = ({ deptAnalytics, hiringTrend }) => (
    <>
      <Card className="shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Department-wise Employee Count</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAnalytics}>
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hiring Trend (Last 6 Months)</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hiringTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const RecentActivities = ({ activities }) => (
    <Card className="border shadow">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-700" /> Recent Activities
        </h3>
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((a, idx) => (
              <div
                key={idx}
                className="border-b last:border-none pb-2 flex items-center justify-between"
              >
                <p className="text-gray-700 text-sm">{a.description}</p>
                <span className="text-xs text-gray-400">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent activity found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const UserTable = ({ users }) => (
    <div className="overflow-y-auto max-h-[60vh] rounded-lg border border-gray-100">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Department</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-2">{u.full_name || u.name}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.department}</td>
              <td className="px-4 py-2">
                <span className="text-green-600 font-medium">Active</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Portal Modal (keeps existing behavior)
  const PortalModal = ({ title, children, onClose }) => {
    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const modalContent = (
      <div
        className="fixed inset-0 flex items-center justify-center animate-fade-in"
        style={{
          zIndex: 999999,
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      >
        <div
          className="bg-white border-gray-200 p-6 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button
              onClick={onClose}
              title="Close"
              className="text-gray-500 hover:text-black transition"
            >
              <X size={22} />
            </button>
          </div>

          {children}
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        
        

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          <Topbar onToggle={() => {}} />

          <main className="p-6">
            {/* Top summary / cards like AtrioHR */}
            <section className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OverviewCard
                  title="Total Employees"
                  value={stats.total_employees || 0}
                  icon={<Users className="w-6 h-6" />}
                  gradient="bg-gradient-to-r from-teal-400 to-cyan-500"
                />
                <OverviewCard
                  title="Total Managers"
                  value={stats.total_managers || 0}
                  icon={<Briefcase className="w-6 h-6" />}
                  gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                />
                <OverviewCard
                  title="Total HR"
                  value={stats.total_hr || 0}
                  icon={<UserPlus className="w-6 h-6" />}
                  gradient="bg-gradient-to-r from-yellow-400 to-orange-400"
                />
                <OverviewCard
                  title="Total Candidates"
                  value={stats.total_candidates || 0}
                  icon={<UserCog className="w-6 h-6" />}
                  gradient="bg-gradient-to-r from-blue-400 to-indigo-500"
                />
              </div>
            </section>

            {/* Middle content: charts and table */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Overview</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard
                      icon={<Users className="w-6 h-6" />}
                      title="Active Employees"
                      value={stats.total_employees || 0}
                      onClick={() => setShowEmployees(true)}
                    />
                    <StatCard
                      icon={<Briefcase className="w-6 h-6" />}
                      title="Managers"
                      value={stats.total_managers || 0}
                      onClick={() => setShowManagers(true)}
                    />
                    <StatCard
                      icon={<UserPlus className="w-6 h-6" />}
                      title="HR Staff"
                      value={stats.total_hr || 0}
                      onClick={() => setShowHR(true)}
                    />
                    <StatCard
                      icon={<UserCog className="w-6 h-6" />}
                      title="Candidates"
                      value={stats.total_candidates || 0}
                      onClick={() => setShowCandidates(true)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border-gray-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Department Employee Count</h3>
                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptAnalytics}>
                          <XAxis dataKey="department" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="employees" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border-gray-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Hiring Trend</h3>
                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hiringTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: recent users/activities */}
              <div className="space-y-6">
                <div className="bg-white border-gray-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">User Management</h3>
                  <UserTable users={users} />
                </div>

                <RecentActivities activities={activities} />
              </div>
            </section>

            {/* Settings / actions */}
            <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Settings & Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowAddDept(true)}>Add New Department</Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowLeavePolicy(true)}>Set Default Leave Policy</Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowManageAdmin(true)}>Manage Admin Users</Button>
                </div>
              </div>

              <div className="bg-white border-gray-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Departments</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {departments.length > 0 ? (
                    departments.map((d, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border text-center text-sm">
                        {d.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No departments found.</div>
                  )}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* All Modals (same as before) */}
      {showAddDept && (
        <PortalModal title="Add Department" onClose={() => setShowAddDept(false)}>
          <input
            type="text"
            placeholder="Department Name"
            className="w-full p-2 border rounded-md mb-4"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
          />
          <Button onClick={handleAddDepartment} className="w-full bg-indigo-600 text-white">
            Add Department
          </Button>
        </PortalModal>
      )}

      {showLeavePolicy && (
        <PortalModal title="Set Default Leave Policy" onClose={() => setShowLeavePolicy(false)}>
          <input
            type="number"
            className="w-full p-2 border rounded-md mb-4"
            value={leaveDays}
            onChange={(e) => setLeaveDays(e.target.value)}
          />
          <Button onClick={handleSetLeavePolicy} className="w-full bg-green-600 text-white">
            Save Policy
          </Button>
        </PortalModal>
      )}

      {showManageAdmin && (
        <PortalModal title="Promote Admin User" onClose={() => setShowManageAdmin(false)}>
          <input
            type="email"
            className="w-full p-2 border rounded-md mb-4"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <Button onClick={handleManageAdmin} className="w-full bg-blue-600 text-white">
            Promote User
          </Button>
        </PortalModal>
      )}

      {showEmployees && (
        <PortalModal
          title="All Employees"
          onClose={() => setShowEmployees(false)}
        >
          <UserTable users={users.filter((u) => u.role?.toLowerCase() === "employee")} />
        </PortalModal>
      )}

      {showManagers && (
        <PortalModal title="All Managers" onClose={() => setShowManagers(false)}>
          <UserTable users={users.filter((u) => u.role?.toLowerCase() === "manager")} />
        </PortalModal>
      )}

      {showHR && (
        <PortalModal title="All HR Staff" onClose={() => setShowHR(false)}>
          <UserTable users={users.filter((u) => u.role?.toLowerCase() === "hr")} />
        </PortalModal>
      )}

      {showCandidates && (
        <PortalModal title="All Candidates" onClose={() => setShowCandidates(false)}>
          <UserTable users={users.filter((u) => u.role?.toLowerCase() === "candidate")} />
        </PortalModal>
      )}

      {showDepartments && (
        <PortalModal title="All Departments" onClose={() => setShowDepartments(false)}>
          <ul className="space-y-2">
            {departments.length > 0 ? (
              departments.map((d, i) => (
                <li key={i} className="border-b pb-2 text-gray-700 font-medium">
                  {d.name}
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No departments found.</p>
            )}
          </ul>
        </PortalModal>
      )}
    </div>
  );
}
