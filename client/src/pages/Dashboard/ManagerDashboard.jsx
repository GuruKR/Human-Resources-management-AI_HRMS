import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import {
  LogOut,
  UserPlus,
  CalendarDays,
  Brain,
  Bell,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * ManagerDashboard.jsx
 * - Uses live backend APIs to populate data
 * - Adds modals: Team details, On-Leave details, Notifications
 * - Assign Task modal is live (POST)
 * - Clicking Total Team / On Leave opens detailed modal similar to AdminDashboard logic
 *
 * Requirements (backend endpoints expected):
 * GET  /api/manager/team/:managerId
 * GET  /api/manager/leaves/:managerId
 * GET  /api/manager/tasks/:managerId
 * GET  /api/manager/meetings/:managerId
 * GET  /api/manager/notifications/:managerId   (optional; if missing, notifications will be empty)
 * POST /api/manager/tasks
 * POST /api/manager/leaves/:leaveId/approve
 * POST /api/manager/leaves/:leaveId/reject
 * POST /api/manager/tasks/:taskId/complete
 */

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState({ total: 0, onLeave: 0, avgRating: 0 });
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [perfData, setPerfData] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assigneeId: "",
    title: "",
    deadline: "",
    priority: "Normal",
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const API = "http://localhost:5000/api/manager";

  // --- Fetch Live Data (team, leaves, tasks, meetings, notifications) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const managerId = user._id;

        const [teamRes, leavesRes, tasksRes, meetingsRes, notificationsRes] =
          await Promise.all([
            axios.get(`${API}/team/${managerId}`),
            axios.get(`${API}/leaves/${managerId}`),
            axios.get(`${API}/tasks/${managerId}`),
            axios.get(`${API}/meetings/${managerId}`),
            // notifications may not exist on some backends; catch below if it fails
            axios.get(`${API}/notifications/${managerId}`).catch(() => ({ data: [] })),
          ]);

        // teamRes expected shape: { team: [...], stats: { total, onLeave, avgRating } }
        const teamData = teamRes.data?.team || [];
        const statsData = teamRes.data?.stats || {
          total: teamData.length,
          onLeave: 0,
          avgRating: 0,
        };

        setTeam(teamData);
        setStats(statsData);
        setPendingLeaves(leavesRes.data || []);
        setTasks(tasksRes.data || []);
        setMeetings(meetingsRes.data || []);
        setNotifications(notificationsRes.data || []);

        const perf = (teamRes.data?.team || []).map((t) => ({
          name: t.name || t.full_name || t.email,
          rating: t.performanceRating || t.performance || 0,
        }));
        setPerfData(perf);
      } catch (err) {
        console.error("Error fetching manager data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- Refresh helper (used after actions) ---
  const refreshData = async () => {
    if (!user?._id) return;
    try {
      const managerId = user._id;
      const [teamRes, leavesRes, tasksRes, meetingsRes, notificationsRes] =
        await Promise.all([
          axios.get(`${API}/team/${managerId}`),
          axios.get(`${API}/leaves/${managerId}`),
          axios.get(`${API}/tasks/${managerId}`),
          axios.get(`${API}/meetings/${managerId}`),
          axios.get(`${API}/notifications/${managerId}`).catch(() => ({ data: [] })),
        ]);

      setTeam(teamRes.data?.team || []);
      setStats(teamRes.data?.stats || { total: 0, onLeave: 0, avgRating: 0 });
      setPendingLeaves(leavesRes.data || []);
      setTasks(tasksRes.data || []);
      setMeetings(meetingsRes.data || []);
      setNotifications(notificationsRes.data || []);

      const perf = (teamRes.data?.team || []).map((t) => ({
        name: t.name || t.full_name || t.email,
        rating: t.performanceRating || t.performance || 0,
      }));
      setPerfData(perf);
    } catch (err) {
      console.error("refreshData error:", err);
    }
  };

  // --- Handlers ---
  const handleApproveLeave = async (leaveId) => {
    try {
      await axios.post(`${API}/leaves/${leaveId}/approve`);
      setPendingLeaves((prev) => prev.filter((l) => l._id !== leaveId));
      await refreshData();
    } catch (err) {
      console.error("approve leave error:", err);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await axios.post(`${API}/leaves/${leaveId}/reject`);
      setPendingLeaves((prev) => prev.filter((l) => l._id !== leaveId));
      await refreshData();
    } catch (err) {
      console.error("reject leave error:", err);
    }
  };

  const openAssignModal = () => setShowAssignModal(true);
  const closeAssignModal = () => {
    setAssignForm({ assigneeId: "", title: "", deadline: "", priority: "Normal" });
    setShowAssignModal(false);
  };

  const submitAssignTask = async (e) => {
    e.preventDefault();
    try {
      if (!assignForm.assigneeId || !assignForm.title) {
        return alert("Select assignee and provide a title");
      }
      const payload = {
        title: assignForm.title,
        assigneeId: assignForm.assigneeId,
        deadline: assignForm.deadline,
        priority: assignForm.priority,
        createdBy: user._id,
      };
      const res = await axios.post(`${API}/tasks`, payload);
      // add to UI
      setTasks((prev) => [res.data, ...prev]);
      // optionally refresh notifications
      await refreshData();
      closeAssignModal();
    } catch (err) {
      console.error("assign task error:", err);
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      await axios.post(`${API}/tasks/${taskId}/complete`);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: "Completed" } : t)));
      await refreshData();
    } catch (err) {
      console.error("complete task error:", err);
    }
  };

  // --- Utility: compute who is on leave today & absentee tasks ---
  const today = new Date();
  function isDateWithin(dateStrFrom, dateStrTo) {
    if (!dateStrFrom || !dateStrTo) return false;
    const from = new Date(dateStrFrom);
    const to = new Date(dateStrTo);
    // normalize dates (ignore time)
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return today >= from && today <= to;
  }

  // Build a quick map of tasks by assignee for modal displays
  const tasksByAssignee = tasks.reduce((acc, t) => {
    const id = t.assigneeId?._id || t.assigneeId;
    if (!id) return acc;
    if (!acc[id]) acc[id] = [];
    acc[id].push(t);
    return acc;
  }, {});

  // Employees currently on leave (approved and today within from-to)
  const onLeaveEmployees = (pendingLeaves.concat([])).filter(
    (l) => l.status === "approved" && isDateWithin(l.from, l.to)
  );

  // --- Subcomponents (StatCard, LeaveTable, TasksTable, PerformanceChart, MeetingsList) ---
  function StatCard({ title, value, icon, onClick }) {
    return (
      <div
        onClick={onClick}
        className="bg-white shadow-sm rounded-2xl p-4 flex items-center gap-4 border cursor-pointer hover:shadow-md transition"
      >
        <div className="p-3 bg-yellow-50 rounded-lg">{icon}</div>
        <div className="flex-1">
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-2xl font-semibold text-gray-800">{value}</div>
        </div>
      </div>
    );
  }

  function LeaveTable() {
    return (
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Pending Leave Requests</h3>
          <div className="text-sm text-gray-500">{pendingLeaves.length} pending</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Employee</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.map((l) => (
                <tr key={l._id} className="border-t">
                  <td className="py-3">{l.employeeId?.name || l.employeeName}</td>
                  <td>{new Date(l.from).toLocaleDateString()}</td>
                  <td>{new Date(l.to).toLocaleDateString()}</td>
                  <td className="capitalize">{l.reason}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleApproveLeave(l._id)}
                      className="mr-2 px-3 py-1 rounded-md bg-green-500 text-white text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectLeave(l._id)}
                      className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {pendingLeaves.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No pending leaves
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function TasksTable() {
    return (
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Tasks & Assignments</h3>
          <div className="flex items-center gap-3">
            <button onClick={openAssignModal} className="px-3 py-2 rounded-lg bg-yellow-500 text-white">
              Assign Task
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Title</th>
                <th>Assignee</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="py-3">{t.title}</td>
                  <td>{t.assigneeId?.name || t.assigneeName}</td>
                  <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : "-"}</td>
                  <td>{t.priority}</td>
                  <td>{t.status}</td>
                  <td className="py-2 text-right">
                    {t.status !== "Completed" && (
                      <button onClick={() => markTaskComplete(t._id)} className="px-3 py-1 rounded-md bg-green-500 text-white text-sm">
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function PerformanceChart() {
    return (
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Performance Overview</h3>
          <div className="text-xs text-gray-500">Current Ratings</div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="rating" barSize={20} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  function MeetingsList() {
    return (
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Upcoming Meetings</h3>
          <div className="text-xs text-gray-500">{meetings.length} scheduled</div>
        </div>
        <ul className="space-y-3">
          {meetings.map((m) => (
            <li key={m._id} className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <div className="font-medium">{m.title}</div>
                <div className="text-xs text-gray-500">{new Date(m.datetime).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-600">Attendees: {m.attendees?.length || 0}</div>
            </li>
          ))}
          {meetings.length === 0 && <li className="text-gray-500">No upcoming meetings</li>}
        </ul>
      </div>
    );
  }

  // --- Modals: Team, Leave, Notifications (PortalModal implementation like Admin) ---
  const PortalModal = ({ title, children, onClose }) => {
    React.useEffect(() => {
      const handleKey = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const modalContent = (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 999999, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-300 w-[95%] max-w-4xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose} title="Close" className="text-gray-500 hover:text-black transition">
              <X size={22} />
            </button>
          </div>
          {children}
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  const TeamModal = ({ onClose }) => {
    return (
      <PortalModal title="Team Members & Tasks" onClose={onClose}>
        <div className="space-y-4">
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Performance</th>
                  <th className="px-4 py-2 text-left">Assigned Tasks (open)</th>
                </tr>
              </thead>
              <tbody>
                {team.length > 0 ? (
                  team.map((member) => {
                    const memberId = member._id || member.id;
                    const memberTasks = (tasksByAssignee[memberId] || []).filter(t => t.status !== "Completed");
                    return (
                      <tr key={memberId} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{member.name || member.full_name}</td>
                        <td className="px-4 py-3">{member.position || member.role || member.department}</td>
                        <td className="px-4 py-3">{member.performanceRating ?? member.performance ?? "0"}</td>
                        <td className="px-4 py-3">
                          {memberTasks.length > 0 ? (
                            <ul className="space-y-1">
                              {memberTasks.map((t) => (
                                <li key={t._id} className="text-sm">
                                  <strong>{t.title}</strong> — due {t.deadline ? new Date(t.deadline).toLocaleDateString() : "—"} <span className="text-xs text-gray-500">({t.priority})</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 text-sm">No open tasks</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">No team members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </PortalModal>
    );
  };

  const LeaveModal = ({ onClose }) => {
    // Show current on-leave employees and tasks they missed (absentee tasks for today)
    const onLeaveList = team.filter((tm) =>
      onLeaveEmployees.some((l) => (l.employeeId?._id || l.employeeId) === (tm._id || tm.id || tm._id))
    );

    // find tasks due today and incomplete for onLeave employees
    const absenteeInfo = onLeaveList.map((emp) => {
      const id = emp._id || emp.id;
      const openTasks = (tasksByAssignee[id] || []).filter(
        (t) => t.status !== "Completed"
      );
      const dueToday = openTasks.filter((t) => {
        if (!t.deadline) return false;
        const d = new Date(t.deadline);
        return d.toDateString() === today.toDateString();
      });
      return { emp, openTasks, dueToday };
    });

    return (
      <PortalModal title="On Leave — Details" onClose={onClose}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Employees currently on leave and tasks they may miss.</p>
          <div className="overflow-y-auto max-h-[60vh]">
            {absenteeInfo.length === 0 && <p className="text-gray-500">No employees are on leave today.</p>}
            {absenteeInfo.map((info) => (
              <div key={info.emp._id || info.emp.id} className="border rounded-lg p-4 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{info.emp.name || info.emp.full_name}</h4>
                    <div className="text-xs text-gray-500">{info.emp.position || info.emp.role || info.emp.department}</div>
                    <div className="text-sm mt-2">Performance: <strong>{info.emp.performanceRating ?? info.emp.performance ?? "0"}</strong></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {/* find leave entry for this emp */}
                    {(() => {
                      const lv = onLeaveEmployees.find((l) => (l.employeeId?._id || l.employeeId) === (info.emp._id || info.emp.id));
                      if (!lv) return <div>-</div>;
                      return (
                        <div className="text-right">
                          <div>From: {new Date(lv.from).toLocaleDateString()}</div>
                          <div>To: {new Date(lv.to).toLocaleDateString()}</div>
                          <div className="capitalize">Reason: {lv.reason}</div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="font-medium">Open Tasks</h5>
                  {info.openTasks.length === 0 ? (
                    <p className="text-gray-500 text-sm">No open tasks.</p>
                  ) : (
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {info.openTasks.map((t) => (
                        <li key={t._id} className="text-sm">
                          <strong>{t.title}</strong> — due {t.deadline ? new Date(t.deadline).toLocaleDateString() : "—"} {t.status !== "Completed" && <span className="text-xs text-gray-500">({t.priority})</span>}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3">
                    <h6 className="font-medium">Due Today</h6>
                    {info.dueToday.length === 0 ? (
                      <p className="text-gray-500 text-sm">No tasks due today.</p>
                    ) : (
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {info.dueToday.map((t) => (
                          <li key={t._id} className="text-sm">{t.title} — <span className="text-xs text-gray-500">{t.priority}</span></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PortalModal>
    );
  };

  const NotificationsModal = ({ onClose }) => {
    return (
      <PortalModal title="Notifications" onClose={onClose}>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found.</p>
          ) : (
            notifications.map((n) => (
              <div key={n._id || n.id} className="border-b last:border-none py-2">
                <div className="text-sm text-gray-700">{n.message || n.description}</div>
                <div className="text-xs text-gray-400">{new Date(n.timestamp || n.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </PortalModal>
    );
  };

  // --- Main render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 border mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">👋 Welcome, <span className="capitalize text-yellow-700">{user?.full_name || "Manager"}</span>!</h1>

            <p className="text-sm text-gray-600">Role: <span className="font-medium text-yellow-600">{user?.role}</span></p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="font-medium">Notifications</span>
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-md">
                {notifications.length}
              </span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <StatCard
            title="Total Team"
            value={stats.total}
            icon={<UserPlus />}
            onClick={() => setShowTeamModal(true)}
          />
          <StatCard
            title="On Leave"
            value={stats.onLeave}
            icon={<CalendarDays />}
            onClick={() => setShowLeaveModal(true)}
          />
          <StatCard
            title="Avg Rating"
            value={stats.avgRating}
            icon={<Brain />}
            onClick={() => setShowTeamModal(true)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LeaveTable />
            <TasksTable />
          </div>

          <div className="space-y-6">
            <PerformanceChart />
            <MeetingsList />
          </div>
        </div>

        {/* Assign Task Modal */}
        {showAssignModal && (
          <PortalModal title="Assign Task" onClose={closeAssignModal}>
            <form onSubmit={submitAssignTask} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Assignee</label>
                <select value={assignForm.assigneeId} onChange={(e) => setAssignForm({ ...assignForm, assigneeId: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                  <option value="">Select employee</option>
                  {team.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name || m.full_name} — {m.position || m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Title</label>
                <input value={assignForm.title} onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Deadline</label>
                  <input type="date" value={assignForm.deadline} onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })} className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <select value={assignForm.priority} onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })} className="w-full mt-1 p-2 border rounded-md">
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={closeAssignModal} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-yellow-500 text-white">Assign</button>
              </div>
            </form>
          </PortalModal>
        )}

        {/* Team Modal */}
        {showTeamModal && <TeamModal onClose={() => setShowTeamModal(false)} />}

        {/* Leave Modal */}
        {showLeaveModal && <LeaveModal onClose={() => setShowLeaveModal(false)} />}

        {/* Notifications Modal */}
        {showNotificationsModal && <NotificationsModal onClose={() => setShowNotificationsModal(false)} />}

      </div>
    </div>
  );
}
