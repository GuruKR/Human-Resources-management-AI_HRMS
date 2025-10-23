import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // optional toast notifications

const API = "http://localhost:5000/api/employees";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    status: "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form);
      toast.success("✅ Employee added successfully!");
      navigate("/hr-dashboard");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add employee");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ➕ Add New Employee
        </h2>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Department Field */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Department</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        {/* Status Field */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition w-full"
        >
          Add Employee
        </button>
      </form>
    </div>
  );
}
