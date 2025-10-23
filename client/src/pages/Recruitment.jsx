import React from "react";
import Layout from "../components/Layout";

export default function Recruitment({ user, onLogout }) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
        <p className="text-gray-600 mt-2">
          Manage job openings, candidates, and recruitment analytics from this page.
        </p>

        <div className="mt-6 space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="font-semibold text-gray-800">Open Positions</h2>
            <p className="text-sm text-gray-600">Feature coming soon...</p>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="font-semibold text-gray-800">AI Screening Reports</h2>
            <p className="text-sm text-gray-600">AI-based candidate screening summaries will appear here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
