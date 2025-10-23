import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from "../api/config";
import Layout from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Eye, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Candidates = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${API}/candidates`);
      setCandidates(response.data);
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (candidateId, newStatus) => {
    try {
      await axios.patch(`${API}/candidates/${candidateId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchCandidates();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const startAIInterview = async (candidateId) => {
    try {
      const response = await axios.post(`${API}/interviews`, {
        candidate_id: candidateId,
        interviewer_id: user.id,
        interview_type: 'ai_chat'
      });
      toast.success('AI Interview started!');
      navigate(`/interview/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to start interview');
    }
  };

  const viewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDialog(true);
  };

  const filteredCandidates = candidates.filter(c => 
    filter === 'all' || c.status === filter
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="candidates-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600 mt-1">Manage and review candidate applications</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48" data-testid="filter-select">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No candidates found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="card-hover" data-testid={`candidate-card-${candidate.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{candidate.full_name}</h3>
                          <p className="text-sm text-gray-600">{candidate.position_applied}</p>
                        </div>
                        <Badge className={`status-badge status-${candidate.status}`}>
                          {candidate.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{candidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{candidate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(candidate.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">AI Score</p>
                          <p className={`text-2xl font-bold ${
                            candidate.ai_score >= 70 ? 'text-green-600' :
                            candidate.ai_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {candidate.ai_score || 'N/A'}
                          </p>
                        </div>
                        {candidate.ai_analysis?.recommendation && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">Recommendation</p>
                            <p className="text-sm font-semibold capitalize">
                              {candidate.ai_analysis.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDetails(candidate)}
                        data-testid={`view-details-button-${candidate.id}`}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      {(user.role === 'admin' || user.role === 'hr_recruiter') && (
                        <>
                          {candidate.status === 'shortlisted' && (
                            <Button
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700"
                              onClick={() => startAIInterview(candidate.id)}
                              data-testid={`start-interview-button-${candidate.id}`}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              AI Interview
                            </Button>
                          )}
                          <Select
                            value={candidate.status}
                            onValueChange={(value) => updateStatus(candidate.id, value)}
                          >
                            <SelectTrigger className="w-full" data-testid={`status-select-${candidate.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="interviewing">Interviewing</SelectItem>
                              <SelectItem value="hired">Hired</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="candidate-details-dialog">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCandidate.full_name}</DialogTitle>
                <DialogDescription>{selectedCandidate.position_applied}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">{selectedCandidate.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Score</p>
                    <p className={`text-2xl font-bold ${
                      selectedCandidate.ai_score >= 70 ? 'text-green-600' :
                      selectedCandidate.ai_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedCandidate.ai_score}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Badge className={`status-badge status-${selectedCandidate.status}`}>
                      {selectedCandidate.status}
                    </Badge>
                  </div>
                </div>

                {selectedCandidate.ai_analysis && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">AI Analysis</h4>
                    {selectedCandidate.ai_analysis.summary && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Summary</p>
                        <p className="text-gray-900">{selectedCandidate.ai_analysis.summary}</p>
                      </div>
                    )}
                    {selectedCandidate.ai_analysis.strengths && selectedCandidate.ai_analysis.strengths.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Strengths</p>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedCandidate.ai_analysis.strengths.map((strength, idx) => (
                            <li key={idx} className="text-gray-900">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedCandidate.ai_analysis.concerns && selectedCandidate.ai_analysis.concerns.length > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Concerns</p>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedCandidate.ai_analysis.concerns.map((concern, idx) => (
                            <li key={idx} className="text-gray-900">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {selectedCandidate.resume_text && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Resume</h4>
                    <div className="p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                        {selectedCandidate.resume_text}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Candidates;
