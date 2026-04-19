import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, RefreshCw, MessageSquare, Wrench, Clock, Trash2, Edit2 } from 'lucide-react';
import Layout from '../../../components/Layout';
import SectionHeader from '../../student-user-ui/components/SectionHeader';
import SurfaceCard from '../../student-user-ui/components/SurfaceCard';
import StatusBadge from '../../student-user-ui/components/StatusBadge';
import ToastStack from '../../student-user-ui/components/ToastStack';

// Mocked technician user until auth is fully implemented
const MOCK_TECHNICIAN = {
  id: 'tech-user-001',
  name: 'John Tech',
  role: 'TECHNICIAN'
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const TechnicianMaintenancePage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [visibleToRequester, setVisibleToRequester] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const pushToast = (tone, title, message = '') => {
    const id = `${tone}-${Date.now()}`;
    setToasts((c) => [...c, { id, tone, title, message }]);
    setTimeout(() => setToasts((c) => c.filter((t) => t.id !== id)), 3000);
  };

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      // Temporarily bypass token logic or assume token adds tech headers
      const res = await axios.get('/api/technician/tickets');
      setRequests(res.data);
      if (res.data.length > 0 && !selectedRequestId) {
        setSelectedRequestId(res.data[0].id);
      }
    } catch (error) {
      pushToast('error', 'Failed to load assigned tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetails = async (id) => {
    setIsDetailLoading(true);
    try {
      // A dedicated details fetch if needed, for now we re-find from array or mimic refresh
      const res = await axios.get('/api/technician/tickets');
      const req = res.data.find(r => r.id === id);
      setSelectedRequest(req);
    } catch (e) {
      pushToast('error', 'Failed to load details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedRequestId) loadDetails(selectedRequestId);
  }, [selectedRequestId]);

  const handleSaveComment = async () => {
    if (!commentText.trim()) return;
    try {
      const payload = { message: commentText, visibleToRequester };
      if (editingCommentId) {
        await axios.put(`/api/technician/tickets/${selectedRequestId}/comments/${editingCommentId}`, payload);
        pushToast('success', 'Comment updated');
      } else {
        await axios.post(`/api/technician/tickets/${selectedRequestId}/comments`, payload);
        pushToast('success', 'Comment added');
      }
      setCommentText('');
      setEditingCommentId(null);
      setVisibleToRequester(false);
      loadDetails(selectedRequestId);
    } catch (error) {
      pushToast('error', 'Failed to save comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`/api/technician/tickets/${selectedRequestId}/comments/${commentId}`);
      pushToast('success', 'Comment deleted');
      loadDetails(selectedRequestId);
    } catch (error) {
      pushToast('error', 'Failed to delete comment');
    }
  };

  return (
    <Layout>
      <ToastStack toasts={toasts} />
      <div className="space-y-8 text-slate-900 pb-20">
        <SurfaceCard className="p-7 sm:p-9" tone="hero">
          <SectionHeader
            eyebrow="Technician Dashboard"
            icon={<Wrench size={14} />}
            title={`Assigned Tickets for ${MOCK_TECHNICIAN.name}`}
            actions={
              <button
                onClick={loadRequests}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold shadow-sm"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            }
          />
        </SurfaceCard>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[380px_1fr]">
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${selectedRequestId === req.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                >
                  <p className="font-semibold">{req.ticketId} - {req.title}</p>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>{req.priority}</span>
                    <StatusBadge status={req.status} className="scale-90 origin-right" />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {isDetailLoading || !selectedRequest ? (
                <SurfaceCard className="flex h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" />
                </SurfaceCard>
              ) : (
                <SurfaceCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black">{selectedRequest.title}</h2>
                      <p className="text-slate-500 mt-1">{selectedRequest.location} &middot; {selectedRequest.category}</p>
                    </div>
                    <StatusBadge status={selectedRequest.status} />
                  </div>
                  
                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-2"><Clock size={14}/> SLA Metrics</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-600">Response Due</p>
                        <p className="font-semibold text-blue-900">{formatDate(selectedRequest.slaResponseDeadline)}</p>
                        <p className="text-[10px] uppercase mt-1 text-slate-500">Actual: {formatDate(selectedRequest.actualFirstResponseAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Resolution Due</p>
                        <p className="font-semibold text-blue-900">{formatDate(selectedRequest.slaResolutionDeadline)}</p>
                        <p className="text-[10px] uppercase mt-1 text-slate-500">Actual: {formatDate(selectedRequest.actualResolutionAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded inline-block">
                      Status: {selectedRequest.slaStatus?.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-bold flex items-center gap-2 mb-4"><MessageSquare size={16}/> Comments & Notes</h3>
                    <div className="space-y-3 mb-6">
                      {(selectedRequest.comments || []).filter(c => !c.softDeleted).map(c => (
                        <div key={c.id} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-700">{c.authorName} <span className="font-normal text-slate-400">({c.authorRole})</span> {c.visibleToRequester ? <span className="bg-emerald-100 text-emerald-800 px-1 rounded ml-1">Visible</span> : <span className="bg-slate-200 text-slate-600 px-1 rounded ml-1">Internal</span>}</p>
                            <span className="text-[10px] text-slate-400">{formatDate(c.timestamp)} {c.editedAt && '(edited)'}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-800">{c.message}</p>
                          
                          {/* MOCK OWNERSHIP CHECK */}
                          {c.authorName === MOCK_TECHNICIAN.name && (
                            <div className="mt-3 flex items-center gap-3">
                              <button onClick={() => { setEditingCommentId(c.id); setCommentText(c.message); setVisibleToRequester(c.visibleToRequester); }} className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"><Edit2 size={12}/> Edit</button>
                              <button onClick={() => handleDeleteComment(c.id)} className="text-xs font-semibold text-rose-600 flex items-center gap-1 hover:underline"><Trash2 size={12}/> Delete</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-bold mb-2">{editingCommentId ? 'Edit Comment' : 'Add Comment'}</p>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Type your comment..."
                        rows={3}
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input type="checkbox" checked={visibleToRequester} onChange={(e) => setVisibleToRequester(e.target.checked)} className="rounded border-slate-300 text-blue-600"/>
                          Visible to Requester
                        </label>
                        <div className="flex gap-2">
                          {editingCommentId && <button onClick={() => { setEditingCommentId(null); setCommentText(''); }} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>}
                          <button onClick={handleSaveComment} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SurfaceCard>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TechnicianMaintenancePage;
