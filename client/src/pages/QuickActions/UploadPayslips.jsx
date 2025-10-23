import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/hr/upload-payslips";

export default function UploadPayslips() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file first!");

    const formData = new FormData();
    formData.append("payslip", file);

    try {
      await axios.post(API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Payslips uploaded successfully!");
      navigate("/hr-dashboard");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to upload payslips");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🧾 Upload Payslips
        </h2>

        <input
          type="file"
          accept=".pdf,.csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full border border-gray-300 rounded-lg p-2"
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg w-full transition"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
