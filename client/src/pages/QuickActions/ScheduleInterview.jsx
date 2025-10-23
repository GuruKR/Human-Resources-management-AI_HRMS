import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/interviews";

export default function ScheduleInterview() {
  const [candidates, setCandidates] = useState([]);
  const [form, setForm] = useState({
    candidate_id: "",
    date: "",
    interview_type: "manual",
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/candidates")
      .then((res) => setCandidates(res.data))
      .catch(() => toast.error("Failed to load candidates"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form);
      toast.success("✅ Interview scheduled successfully!");
      navigate("/hr-dashboard");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to schedule interview");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-green-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📅 Schedule Interview
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Candidate</label>
          <select
            name="candidate_id"
            value={form.candidate_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Select Candidate</option>
            {candidates.map((c) => (
              <option key={c._id} value={c._id}>
                {c.full_name} - {c.position}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Interview Type</label>
          <select
            name="interview_type"
            value={form.interview_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="manual">Manual</option>
            <option value="ai_chat">AI Chat</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg w-full transition"
        >
          Schedule
        </button>
      </form>
    </div>
  );
}
