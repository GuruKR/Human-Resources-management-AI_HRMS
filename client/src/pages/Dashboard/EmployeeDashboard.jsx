import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  Edit3,
  Upload,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState({});
  const [leaves, setLeaves] = useState({});
  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState({});
  const [payroll, setPayroll] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    department: "",
    phone: "",
    gender: "",
  });
  const [documents, setDocuments] = useState([]);

  const API = "http://localhost:5000/api";

  useEffect(() => {
    if (!user || !user._id) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [
        attendanceRes,
        leavesRes,
        taskRes,
        perfRes,
        payrollRes,
        announceRes,
        employeeRes,
      ] = await Promise.all([
        axios.get(`${API}/attendance/${user._id}`),
        axios.get(`${API}/leaves/${user._id}`),
        axios.get(`${API}/tasks/${user._id}`),
        axios.get(`${API}/performance/${user._id}`),
        axios.get(`${API}/payroll/${user._id}`),
        axios.get(`${API}/announcements`),
        axios.get(`${API}/employees/${user._id}`),
      ]);

      setAttendance(attendanceRes.data || {});
      setLeaves(leavesRes.data || {});
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.tasks || []);
      setPerformance(perfRes.data || {});
      setPayroll(payrollRes.data || {});
      setAnnouncements(announceRes.data || []);
      setDocuments(employeeRes.data?.documents || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to fetch dashboard data");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleMarkAttendance = async () => {
    try {
      await axios.post(`${API}/attendance/mark`, {
        employeeId: user._id,
        status: "Present",
        checkInTime: new Date().toLocaleTimeString(),
      });
      toast.success("Attendance marked successfully!");
      fetchData();
    } catch {
      toast.error("Already marked or failed to mark attendance");
    }
  };

  const handleApplyLeave = async () => {
    const from = prompt("Enter from date (YYYY-MM-DD):");
    const to = prompt("Enter to date (YYYY-MM-DD):");
    const reason = prompt("Enter reason for leave:");
    if (!from || !to || !reason) return toast.error("All fields required");

    try {
      await axios.post(`${API}/leaves/apply`, { employeeId: user._id, from, to, reason });
      toast.success("Leave application submitted!");
      fetchData();
    } catch {
      toast.error("Failed to apply leave");
    }
  };

  const openEditProfile = () => {
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      department: user.department || "",
      phone: user.phone || "",
      gender: user.gender || "",
    });
    setShowEditProfile(true);
  };

  const saveProfile = async () => {
    try {
      const response = await axios.put(`${API}/employees/update/${user._id}`, editForm);
      toast.success(response.data.msg || "Profile updated successfully!");
      // ✅ Update local & context user
      const updatedUser = { ...user, ...editForm };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("storage")); // refresh context if using localStorage sync
      setShowEditProfile(false);
      setEditForm(updatedUser);
      fetchData();
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    }
  };

  // ✅ Upload Document Logic (HRDashboard-style)
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("employeeId", user._id);
    formData.append("document", file);

    try {
      const res = await axios.post(`${API}/employees/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.msg || "Document uploaded successfully!");
      // ✅ Fetch updated employee data to show new document
      const updatedEmployee = await axios.get(`${API}/employees/${user._id}`);
      setDocuments(updatedEmployee.data.documents || []);

      setShowUploadModal(false);
      
    } catch (err) {
      console.error("❌ Document upload failed:", err);
      toast.error("Failed to upload document");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              👋 Welcome, {user.full_name || "Employee"}!
            </h1>
            <p className="text-gray-600 mt-1 capitalize">
              Role: <span className="font-semibold text-teal-600">{user.role}</span>
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

        {/* Attendance Section */}
        <SectionCard title="🕒 Attendance Overview">
          <p>Status: {attendance.status || "No Records"}</p>
          <p>Total Hours Worked: {attendance.hours || 0} hrs</p>
          <button
            onClick={handleMarkAttendance}
            className="mt-3 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Mark Attendance
          </button>
        </SectionCard>

        {/* Leave Section */}
        <SectionCard title="🏖️ Leave Management">
          <p>Pending Leaves: {leaves.pending || 0}</p>
          <p>Approved Leaves: {leaves.approved || 0}</p>
          <button
            onClick={handleApplyLeave}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Apply for Leave
          </button>
        </SectionCard>

        {/* Tasks */}
        <SectionCard title="📁 Assigned Tasks">
          {tasks.length ? (
            <ul>
              {tasks.map((t) => (
                <li key={t._id} className="border-b py-2 flex justify-between">
                  <span>{t.title}</span>
                  <span className="text-sm text-gray-500">{t.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tasks assigned yet.</p>
          )}
        </SectionCard>

        {/* Payroll */}
        <SectionCard title="💰 Payroll">
          <p>Latest Salary: ₹{payroll.latest?.netPay || 0}</p>
          <p>Status: {payroll.latest?.paymentStatus || "Pending"}</p>
          <button className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            View Payslip
          </button>
        </SectionCard>

        {/* Performance */}
        <SectionCard title="📊 Performance Overview">
          <p>Rating: {performance.rating || "N/A"}</p>
          <p>Last Appraisal: {performance.lastReview || "N/A"}</p>
        </SectionCard>

        {/* Announcements */}
        <SectionCard title="📢 Announcements">
          {announcements.length ? (
            <ul>
              {announcements.map((a) => (
                <li key={a._id} className="border-b py-2">
                  <strong>{a.title}</strong> - {a.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>No new announcements.</p>
          )}
        </SectionCard>

        {/* Profile */}
        <SectionCard title="👤 Profile Information">
          <p><strong>Name:</strong> {user.full_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
          <p><strong>Gender:</strong> {user.gender || "N/A"}</p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={openEditProfile}
              className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              <Upload className="w-4 h-4" /> Upload Documents
            </button>
          </div>

          {/* Uploaded Documents */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">📄 Uploaded Documents</h3>
            {documents.length ? (
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {documents.map((doc, i) => (
                  <li key={i}>
                    <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                      {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents uploaded yet.</p>
            )}
          </div>
        </SectionCard>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <Modal title="Edit Profile" onClose={() => setShowEditProfile(false)}>
            <div className="space-y-3">
              {["full_name", "email", "department", "phone", "gender"].map((field) => (
                <div key={field}>
                  <label className="capitalize text-sm text-gray-600">{field}</label>
                  <input
                    type="text"
                    value={editForm[field]}
                    onChange={(e) =>
                      setEditForm({ ...editForm, [field]: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded mt-1"
                  />
                </div>
              ))}
              <button
                onClick={saveProfile}
                className="mt-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
              >
                Save Changes
              </button>
            </div>
          </Modal>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <Modal title="Upload Documents" onClose={() => setShowUploadModal(false)}>
            <input
              type="file"
              onChange={handleDocumentUpload}
              className="border p-3 w-full rounded"
            />
          </Modal>
        )}
      </div>
    </div>
  );
}

/* Reusable Components */
function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
