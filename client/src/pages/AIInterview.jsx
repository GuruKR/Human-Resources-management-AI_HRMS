import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/ai-live";

export default function AIInterview() {
  const [role, setRole] = useState("Software Engineer");
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);

  const startInterview = async () => {
    setLoading(true);
    const { data } = await axios.post(`${API}/start`, { role });
    setInterviewId(data.interviewId);
    setMessages([{ from: "ai", text: data.question }]);
    setLoading(false);
  };

  const sendAnswer = async () => {
    if (!answer.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: answer }]);
    setAnswer("");
    const { data } = await axios.post(`${API}/answer`, { interviewId, answer });
    if (data.finished) {
      setFinished(true);
      setResult({ score: data.totalScore, feedback: data.feedback });
    } else {
      setMessages((prev) => [...prev, { from: "ai", text: data.nextQuestion }]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-4">🧠 AI Interview Bot</h1>

        {!interviewId && (
          <div className="mb-6">
            <label className="block font-medium mb-2">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 rounded-lg w-full"
            >
              <option>Software Engineer</option>
              <option>Data Analyst</option>
              <option>HR Recruiter</option>
            </select>
            <button
              onClick={startInterview}
              disabled={loading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
          </div>
        )}

        {/* Chat Window */}
        <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg ${
                msg.from === "ai"
                  ? "bg-blue-100 text-gray-800 self-start"
                  : "bg-green-100 text-gray-800 self-end text-right"
              }`}
            >
              <strong>{msg.from === "ai" ? "🤖 AI: " : "🧍 You: "}</strong>
              {msg.text}
            </div>
          ))}
        </div>

        {!finished && interviewId && (
          <div className="mt-4 flex gap-2">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 border p-2 rounded-lg"
            />
            <button
              onClick={sendAnswer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        )}

        {finished && result && (
          <div className="mt-6 p-4 border-t">
            <h2 className="text-xl font-semibold">✅ Interview Completed!</h2>
            <p className="text-gray-700 mt-2">
              <strong>Score:</strong> {result.score}/100
            </p>
            <p className="text-gray-700 mt-1">
              <strong>Feedback:</strong> {result.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
