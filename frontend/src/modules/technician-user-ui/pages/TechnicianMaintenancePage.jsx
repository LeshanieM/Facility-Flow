import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, Loader2, MessageSquare, RefreshCw, Trash2, Wrench, Clock } from 'lucide-react';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import SectionHeader from '../../student-user-ui/components/SectionHeader';
import SurfaceCard from '../../student-user-ui/components/SurfaceCard';
import StatusBadge from '../../student-user-ui/components/StatusBadge';
import ToastStack from '../../student-user-ui/components/ToastStack';
import { formatDateTime } from '../../maintenance/utils/dateTime';

const sortTickets = (items) => [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
const getCommentContent = (comment) => comment?.content || comment?.message || '';
const getCommentCreatedAt = (comment) => comment?.createdAt || comment?.timestamp || null;
const getCommentUpdatedAt = (comment) => comment?.updatedAt || comment?.editedAt || null;
const normalizeIdentity = (value) => String(value || '').trim().toLowerCase();

const TechnicianMaintenancePage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [visibleToRequester, setVisibleToRequester] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const displayName = useMemo(() => {
    return user?.name || user?.sub || user?.email || 'Technician';
  }, [user]);

  const canManageComment = (comment) => {
    if (comment?.canEdit || comment?.canDelete) {
      return true;
    }

    const authorName = normalizeIdentity(comment?.authorName);
    if (!authorName) {
      return false;
    }

    const identityCandidates = [
      user?.name,
      user?.email,
      user?.sub,
      user?.sub ? String(user.sub).split('@')[0] : null,
    ]
      .map(normalizeIdentity)
      .filter(Boolean);

    return identityCandidates.includes(authorName);
  };

  const pushToast = (tone, title, message = '') => {
    const id = `${tone}-${Date.now()}`;
    setToasts((current) => [...current, { id, tone, title, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const syncTicketState = (ticket) => {
    setSelectedRequest(ticket);
    setSelectedRequestId(ticket?.id || null);
    setRequests((current) => {
      const next = current.some((item) => item.id === ticket.id)
        ? current.map((item) => (item.id === ticket.id ? ticket : item))
        : [ticket, ...current];
      return sortTickets(next);
    });
  };

  const resetComposer = () => {
    setCommentText('');
    setVisibleToRequester(false);
    setEditingCommentId(null);
  };

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/technician/tickets');
      const nextRequests = sortTickets(Array.isArray(res.data) ? res.data : []);
      setRequests(nextRequests);

      setSelectedRequestId((currentId) => {
        if (currentId && nextRequests.some((item) => item.id === currentId)) {
          return currentId;
        }
        return nextRequests[0]?.id || null;
      });
    } catch (error) {
      pushToast('error', 'Failed to load assigned tickets', error?.response?.data?.message || '');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetails = async (id) => {
    if (!id) {
      setSelectedRequest(null);
      return;
    }

    const fallbackRequest = requests.find((item) => item.id === id) || null;
    setIsDetailLoading(true);
    try {
      const res = await api.get(`/technician/tickets/${id}`);
      setSelectedRequest(res.data);
    } catch (error) {
      if (fallbackRequest) {
        setSelectedRequest(fallbackRequest);
      } else {
        setSelectedRequest(null);
      }

      const backendMessage = error?.response?.data?.message || '';
      const missingDetailRoute = typeof backendMessage === 'string'
        && backendMessage.includes('No static resource api/technician/tickets/');

      if (missingDetailRoute) {
        pushToast(
          'error',
          'Backend restart required',
          'The running backend does not yet expose the technician detail route. Showing cached ticket data for now.'
        );
      } else {
        pushToast('error', 'Failed to load ticket details', backendMessage);
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    loadDetails(selectedRequestId);
    resetComposer();
  }, [selectedRequestId, requests]);

  const handleSaveComment = async () => {
    if (!commentText.trim() || !selectedRequestId) return;

    try {
      const payload = { message: commentText.trim(), visibleToRequester };
      const response = editingCommentId
        ? await api.put(`/technician/tickets/${selectedRequestId}/comments/${editingCommentId}`, payload)
        : await api.post(`/technician/tickets/${selectedRequestId}/comments`, payload);

      syncTicketState(response.data);
      pushToast('success', editingCommentId ? 'Comment updated' : 'Comment added');
      resetComposer();
    } catch (error) {
      pushToast('error', 'Failed to save comment', error?.response?.data?.message || '');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedRequestId || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await api.delete(`/technician/tickets/${selectedRequestId}/comments/${commentId}`);
      syncTicketState(response.data);
      pushToast('success', 'Comment deleted');
      resetComposer();
    } catch (error) {
      pushToast('error', 'Failed to delete comment', error?.response?.data?.message || '');
    }
  };

  const beginEditing = (comment) => {
    setEditingCommentId(comment.id);
    setCommentText(getCommentContent(comment));
    setVisibleToRequester(Boolean(comment.visibleToRequester));
  };

  const comments = selectedRequest?.comments || [];

  return (
    <Layout>
      <ToastStack toasts={toasts} />
      <div className="space-y-8 text-slate-900 pb-20">
        <SurfaceCard className="p-7 sm:p-9" tone="hero">
          <SectionHeader
            eyebrow="Technician Dashboard"
            icon={<Wrench size={14} />}
            title={`Assigned Tickets for ${displayName}`}
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
              {requests.length === 0 ? (
                <SurfaceCard className="p-6 text-sm text-slate-500">
                  No assigned tickets are available right now.
                </SurfaceCard>
              ) : requests.map((req) => (
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
                  <p className="mt-2 text-xs text-slate-400">Updated {formatDateTime(req.updatedAt || req.createdAt)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {isDetailLoading || (selectedRequestId && !selectedRequest) ? (
                <SurfaceCard className="flex h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600" />
                </SurfaceCard>
              ) : !selectedRequest ? (
                <SurfaceCard className="p-6 text-sm text-slate-500">
                  Select an assigned ticket to review comments and progress notes.
                </SurfaceCard>
              ) : (
                <SurfaceCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black">{selectedRequest.title}</h2>
                      <p className="mt-1 text-slate-500">{selectedRequest.location} - {selectedRequest.category}</p>
                    </div>
                    <StatusBadge status={selectedRequest.status} />
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800"><Clock size={14}/> SLA Metrics</p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-blue-600">Response Due</p>
                        <p className="font-semibold text-blue-900">{formatDateTime(selectedRequest.slaResponseDeadline)}</p>
                        <p className="mt-1 text-[10px] uppercase text-slate-500">Actual: {formatDateTime(selectedRequest.actualFirstResponseAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Resolution Due</p>
                        <p className="font-semibold text-blue-900">{formatDateTime(selectedRequest.slaResolutionDeadline)}</p>
                        <p className="mt-1 text-[10px] uppercase text-slate-500">Actual: {formatDateTime(selectedRequest.actualResolutionAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 inline-block rounded bg-blue-100 px-3 py-1 text-sm font-bold text-blue-900">
                      Status: {selectedRequest.slaStatus?.replace(/_/g, ' ') || 'Not tracked'}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-4 flex items-center gap-2 font-bold"><MessageSquare size={16}/> Comments & Notes</h3>
                    <div className="mb-6 space-y-3">
                      {comments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          No comments have been added to this ticket yet.
                        </div>
                      ) : comments.map((comment) => (
                        <div key={comment.id} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-700">
                                {comment.authorName}
                                <span className="ml-1 font-normal text-slate-400">({comment.authorRole})</span>
                                <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase ${comment.visibleToRequester ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                  {comment.visibleToRequester ? 'Visible to requester' : 'Internal only'}
                                </span>
                              </p>
                              <p className="mt-1 text-[11px] text-slate-400">
                                Created {formatDateTime(getCommentCreatedAt(comment))}
                                {getCommentUpdatedAt(comment) && getCommentUpdatedAt(comment) !== getCommentCreatedAt(comment) ? ` • Updated ${formatDateTime(getCommentUpdatedAt(comment))}` : ''}
                              </p>
                            </div>
                            {canManageComment(comment) && (
                              <div className="flex items-center gap-3">
                                {(comment.canEdit ?? true) && (
                                  <button onClick={() => beginEditing(comment)} className="text-blue-500 hover:text-blue-700 transition-colors">
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                {(comment.canDelete ?? true) && (
                                  <button onClick={() => handleDeleteComment(comment.id)} className="text-rose-500 hover:text-rose-700 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{getCommentContent(comment)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="mb-2 text-sm font-bold">{editingCommentId ? 'Edit Comment' : 'Add Comment'}</p>
                      <textarea
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Type your comment..."
                        rows={3}
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={visibleToRequester}
                            onChange={(event) => setVisibleToRequester(event.target.checked)}
                            className="rounded border-slate-300 text-blue-600"
                          />
                          Visible to Requester
                        </label>
                        <div className="flex gap-2">
                          {editingCommentId && (
                            <button onClick={resetComposer} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                              Cancel
                            </button>
                          )}
                          <button onClick={handleSaveComment} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                            Save
                          </button>
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
