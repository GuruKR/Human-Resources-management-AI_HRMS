import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api/config";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, User, MessageSquare } from "lucide-react";

const AllInterviews = ({ user, onLogout }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get(`${API}/interviews`);
      setInterviews(response.data);
    } catch (error) {
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Interviews</h1>
          <p className="text-gray-600 mt-1">View all AI and manual interview sessions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : interviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No interviews found
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <Card key={interview.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {interview.candidate_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{interview.position_applied}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(interview.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>{interview.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllInterviews;
