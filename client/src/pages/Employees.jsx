import React from "react";
import Layout from "../components/Layout";

export default function Employees({ user, onLogout }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-600 mt-2">
          This page will display all registered employees in your HRMS system.
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <p>👷‍♂️ Employee management module coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}
