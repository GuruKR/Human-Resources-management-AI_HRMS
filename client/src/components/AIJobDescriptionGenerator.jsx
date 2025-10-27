import React, { useState } from "react";
import axios from "axios";
import { Loader2, FileText, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIJobDescriptionGenerator() {
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!role.trim()) return alert("Please enter a job title.");
    setLoading(true);
    setJd("");

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message: `Generate a job description for ${role}`,
      });
      setJd(res.data.reply || "No JD generated.");
    } catch (err) {
      console.error(err);
      setJd("⚠️ Error generating JD. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white text-gray-900 rounded-2xl shadow-lg w-full max-w-4xl mx-auto border border-gray-200 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FileText size={26} className="text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">
          AI Job Description Generator
        </h2>
      </div>

      {/* Input Section */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter job title (e.g., MERN Developer)"
          className="flex-1 p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:border-blue-500 placeholder-gray-400"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition disabled:bg-gray-400"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Output Section */}
      {jd && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-5 max-h-[450px] overflow-y-auto text-sm leading-relaxed text-gray-800">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-xl font-bold text-blue-600 mt-2 mb-1" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-lg font-semibold text-blue-500 mt-3 mb-1" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="text-gray-900 font-semibold" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-800 mb-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="ml-5 list-disc text-gray-800" {...props} />
              ),
            }}
          >
            {jd}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
