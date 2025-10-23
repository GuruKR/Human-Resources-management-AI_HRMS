import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  UserPlus,
  CalendarDays,
  Upload,
  Brain,
  Mic,
  X,
  Loader2,
  FileText,
  Send,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const API = "http://localhost:5000/api/hr";

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: "", content: null });

  // ✅ State for AI JD Generator
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, attRes, payRes] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/attendance`),
          axios.get(`${API}/payroll`),
        ]);
        setStats(statsRes.data);
        setAttendance(attRes.data);
        setPayroll(payRes.data);
      } catch (err) {
        console.error("❌ Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatClick = async (key) => {
    try {
      let res;
      switch (key) {
        case "totalCandidates":
          res = await axios.get(`${API}/candidates`);
          openModal(
            "🧍 All Candidates",
            <DataList
              data={res.data}
              columns={["name", "email", "status"]}
              emptyText="No candidates found."
            />
          );
          break;

        case "hiredThisMonth":
          res = await axios.get(`${API}/hired`);
          openModal(
            "👨‍💼 Hired This Month",
            <DataList
              data={res.data}
              columns={["name", "department"]}
              emptyText="No hires this month."
            />
          );
          break;

        case "pendingInterviews":
          res = await axios.get(`${API}/interviews/pending`);
          openModal("📅 Pending Interviews", <InterviewList data={res.data} />);
          break;

        case "totalEmployees":
          res = await axios.get(`${API}/employees`);
          openModal(
            "👥 Total Employees",
            <DataList
              data={res.data}
              columns={["name", "role", "department"]}
              emptyText="No employees found."
            />
          );
          break;

        case "leaveRequests":
          res = await axios.get(`${API}/leaves`);
          openModal("🌴 Leave Requests", <LeaveList data={res.data} />);
          break;

        default:
          openModal("No Action", <p>No data available for this card.</p>);
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      openModal("Error", <p>Failed to fetch data.</p>);
    }
  };

  const openModal = (title, content) => setModal({ open: true, title, content });
  const closeModal = () => setModal({ open: false, title: "", content: null });

  // ✅ Handle AI JD Generation
  const handleGenerateJD = async () => {
    if (!role.trim()) return alert("Please enter a job title.");
    setAiLoading(true);
    setJd("");

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message: `Generate a job description for ${role}`,
      });
      setJd(res.data.reply || "No JD generated.");
    } catch (err) {
      console.error("❌ Error generating JD:", err);
      setJd("⚠️ Error generating JD. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ FINAL PRODUCTION VERSION — Removes "Ø=ÜÄ", duplicate headers, perfect formatting
  const handleDownloadPDF = async () => {
    if (!jd.trim()) return alert("No job description available to download.");

    // 🧹 Clean AI artifacts and redundant text
    const cleanJD = jd
      .replace(/<s>|<\/s>/gi, "")
      .replace(/\[B_INST\]|\[E_INST\]|\[OUT\]/gi, "")
      .replace(/[ØÜÄ=]+/g, "")                     // remove "Ø=ÜÄ"
      .replace(/^Job Description for.*$/gim, "")    // remove duplicate header text
      .replace(/AI HR Copilot/gi, "")
      .replace(/---+/g, "")                         // remove "---" separators
      .replace(/\r/g, "")
      .replace(/(\w)\n(\w)/g, "$1 $2")              // merge broken sentences
      .replace(/(\d+)\.\s*/g, "\n$1. ")             // ensure numbered points start properly
      .replace(/\n{2,}/g, "\n\n")                   // normalize blank lines
      .trim();

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const marginX = 15;
    const marginY = 20;
    const lineHeight = 7;

    const companyName = "AI HR Copilot";
    const jdTitle = `Job Description for ${role || "Role"}`;

    // 🏢 Header
    const addHeader = () => {
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text(companyName, marginX, marginY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(jdTitle, marginX, marginY + 8);
    };

    // 📄 Footer
    const addFooter = (page, totalPages) => {
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(
        `Generated by AI HR Copilot • Page ${page} of ${totalPages}`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: "center" }
      );
    };

    addHeader();

    let cursorY = marginY + 22;
    let pageNum = 1;

    // ✏️ Helper function for text rendering
    const addLine = (text, { bold = false, indent = 0, bullet = false, numbered = false, color = [0, 0, 0], fontSize = 11 } = {}) => {
      if (!text.trim()) {
        cursorY += lineHeight;
        return;
      }

      if (cursorY > pdfHeight - 20) {
        pdf.addPage();
        pageNum++;
        addHeader();
        cursorY = marginY + 22;
      }

      pdf.setTextColor(...color);
      pdf.setFont("times", bold ? "bold" : "normal");
      pdf.setFontSize(fontSize);

      let formatted = text.trim();
      if (bullet) formatted = `• ${formatted}`;
      if (numbered) formatted = `${formatted}`;

      const wrapped = pdf.splitTextToSize(formatted, pdfWidth - marginX * 2 - indent);
      pdf.text(wrapped, marginX + indent, cursorY);
      cursorY += wrapped.length * lineHeight;
    };

    // 🧠 Merge multi-line paragraphs logically
    const combinedLines = cleanJD
      .split(/\n/)
      .reduce((acc, line) => {
        if (line.trim() === "") acc.push("");
        else if (acc.length && acc[acc.length - 1] !== "")
          acc[acc.length - 1] += " " + line.trim();
        else acc.push(line.trim());
        return acc;
      }, []);

    // 🪶 Parse and style markdown-like structure
    for (let rawLine of combinedLines) {
      const line = rawLine.trim();
      if (!line) {
        cursorY += lineHeight;
        continue;
      }

      // 💠 Blue Section Headings
      if (/^Role Overview:?/i.test(line) || /^Key Responsibilities:?/i.test(line) || /^Required Skills/i.test(line) ||
          /^Preferred Qualifications:?/i.test(line) || /^Education:?/i.test(line) || /^Why Join Us/i.test(line)) {
        addLine(line.replace(/\*\*/g, ""), {
          bold: true,
          fontSize: 13,
          color: [0, 102, 204],
        });
      }
      // Bullet points
      else if (line.match(/^[-*]\s+/)) addLine(line.replace(/^[-*]\s*/, ""), { bullet: true, indent: 5 });
      // Numbered points
      else if (line.match(/^\d+\.\s+/)) addLine(line, { numbered: true, bold: true, indent: 0 });
      // Inline bold (real bold, not **)
      else if (/\*\*(.*?)\*\*/.test(line)) {
        const parts = line.split(/(\*\*.*?\*\*)/);
        for (const seg of parts) {
          if (seg.startsWith("**") && seg.endsWith("**"))
            addLine(seg.replace(/\*\*/g, ""), { bold: true });
          else if (seg.trim()) addLine(seg.trim());
        }
      }
      // Regular paragraph
      else addLine(line);
    }

    // 📑 Add footer to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i, totalPages);
    }

    pdf.save(`${role || "job_description"}.pdf`);
  };


  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700 animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              👋 Welcome, {user?.full_name || "HR"}!
            </h1>
            <p className="text-gray-700 mt-1 capitalize">
              Role:{" "}
              <span className="font-semibold text-indigo-600">{user?.role}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* HR Dashboard */}
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
          👩‍💼 HR Dashboard
        </h2>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {Object.entries(stats).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleStatClick(key)}
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl text-center shadow border border-blue-200 transition-transform transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <p className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <h3 className="text-2xl font-bold text-blue-700 mt-2">{value}</h3>
              </button>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          ⚡ Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={() => navigate("/employees/add")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            <UserPlus className="w-5 h-5" /> Add Employee
          </button>
          <button
            onClick={() => navigate("/payroll/upload")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            <Upload className="w-5 h-5" /> Upload Payslips
          </button>
          <button
            onClick={() => navigate("/interviews/schedule")}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            <CalendarDays className="w-5 h-5" /> Schedule Interview
          </button>
          <button
            onClick={() => navigate("/ai-resume-screening")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            <Brain className="w-5 h-5" /> AI Resume Screening
          </button>
          <button
            onClick={() => navigate("/ai-voice-interview")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
          >
            <Mic className="w-5 h-5" /> Start AI Interview
          </button>
        </div>

        {/* Attendance Snapshot */}
        {attendance && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              📅 Attendance Snapshot
            </h3>
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-gray-800 mb-2">
                ✅ Present:{" "}
                <span className="font-semibold">{attendance.present}</span> | ❌
                Absent:{" "}
                <span className="font-semibold">{attendance.absent}</span> | ⏰ Late:{" "}
                <span className="font-semibold">{attendance.late}</span>
              </p>
              <p className="text-gray-800">
                🏖️ On Leave:{" "}
                {attendance.onLeave?.length ? (
                  attendance.onLeave.map((name, i) => (
                    <span key={i} className="font-medium text-gray-900">
                      {name}
                      {i < attendance.onLeave.length - 1 && ", "}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">
                    No one is on leave today
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Payroll Summary */}
        {payroll && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              💰 Payroll Summary
            </h3>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="text-gray-800">
                  💸 Monthly Expense:{" "}
                  <span className="font-semibold text-purple-700">
                    {payroll.totalExpense}
                  </span>
                </p>
                <p className="text-gray-800 mt-1">
                  📊 Salaries Processed:{" "}
                  <span className="font-semibold text-purple-700">
                    {payroll.salariesProcessed}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✨ AI Job Description Generator Section */}
        <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg w-full mx-auto border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={26} className="text-blue-400" />
            <h2 className="text-xl font-semibold">
              AI Job Description Generator
            </h2>
          </div>

          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Enter job title (e.g., MERN Developer)"
              className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleGenerateJD}
              disabled={aiLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg shadow transition disabled:bg-gray-600"
            >
              {aiLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {aiLoading ? "Generating..." : "Generate"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!jd}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-lg shadow transition disabled:bg-gray-600"
            >
              <Download size={18} /> Download
            </button>
          </div>

          {jd && (
            <div
              id="jd-content"
              className="bg-gray-800 border border-gray-700 rounded-xl p-5 max-h-[450px] overflow-y-auto text-sm leading-relaxed"
            >
              <ReactMarkdown>{jd}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <PortalModal title={modal.title} onClose={closeModal}>
          {modal.content}
        </PortalModal>
      )}
    </div>
  );
}

/* ---------- Components ---------- */

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
      className="fixed inset-0 flex items-center justify-center animate-fadeIn"
      style={{
        zIndex: 999999,
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-gray-300 w-[90%] max-w-3xl p-6 relative animate-slideUp"
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

const DataList = ({ data, columns, emptyText }) => (
  <div className="overflow-y-auto max-h-[70vh] rounded-lg border border-gray-200">
    {data.length ? (
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-2 text-left capitalize">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-t hover:bg-gray-50 transition">
              {columns.map((col, j) => (
                <td key={j} className="px-4 py-2">
                  {item[col] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-gray-500 p-4 text-center">{emptyText}</p>
    )}
  </div>
);

const InterviewList = ({ data }) => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState(data);

  const handleContinue = async (id) => {
    try {
      await axios.post(`${API}/interviews/update/${id}`, { status: "ongoing" });
      navigate("/ai-voice-interview");
    } catch (err) {
      console.error("❌ Error continuing interview:", err);
      alert("Failed to continue interview.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.post(`${API}/interviews/update/${id}`, { status: "cancelled" });
      setInterviews((prev) => prev.filter((item) => item._id !== id));
      alert("Interview cancelled successfully.");
    } catch (err) {
      console.error("❌ Error cancelling interview:", err);
      alert("Failed to cancel interview.");
    }
  };

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
      {interviews.length ? (
        interviews.map((i) => (
          <div
            key={i._id}
            className="border p-3 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <p>
              <strong>{i.candidate?.name || "Unknown Candidate"}</strong> —{" "}
              {i.role || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(i.date).toLocaleString()}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleContinue(i._id)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded transition"
              >
                Continue
              </button>
              <button
                onClick={() => handleCancel(i._id)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">No pending interviews.</p>
      )}
    </div>
  );
};

const LeaveList = ({ data }) => {
  const [leaves, setLeaves] = useState(data.filter((l) => l.status === "pending"));

  const handleDecision = async (id, decision) => {
    try {
      await axios.post(`${API}/leaves/${id}/decision`, { decision });
      setLeaves((prev) => prev.filter((l) => l._id !== id));
      alert(`Leave ${decision === "approved" ? "approved" : "rejected"} successfully.`);
    } catch (err) {
      console.error("❌ Error updating leave:", err);
      alert("Failed to update leave status.");
    }
  };

  return (
    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
      {leaves.length ? (
        leaves.map((l) => (
          <div
            key={l._id}
            className="border p-3 rounded-lg shadow-sm hover:bg-gray-50 transition flex justify-between items-center"
          >
            <div>
              <p>
                <strong>{l.employee?.name || "Unknown Employee"}</strong> — {l.reason}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(l.startDate).toLocaleDateString()} →{" "}
                {new Date(l.endDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDecision(l._id, "approved")}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded transition"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(l._id, "rejected")}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center py-4">
          No pending leave requests.
        </p>
      )}
    </div>
  );
};
