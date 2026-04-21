import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Edit2, Loader2, MessageSquare, RefreshCw, Trash2, Wrench, Clock, Paperclip, Eye, Download, PlayCircle } from 'lucide-react';
import Layout from '../../../components/Layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import SectionHeader from '../../student-user-ui/components/SectionHeader';
import SurfaceCard from '../../student-user-ui/components/SurfaceCard';
import StatusBadge, { INCIDENT_STATUS_OPTIONS } from '../../student-user-ui/components/StatusBadge';
import ToastStack from '../../student-user-ui/components/ToastStack';
import { formatDateTime, formatDateTimeOrFallback, formatDurationMinutes } from '../../maintenance/utils/dateTime';
import { downloadAttachment, getAttachmentName, viewAttachment, getViewerUrl } from '../../maintenance/utils/attachmentActions';

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
  const [attachmentActionKey, setAttachmentActionKey] = useState('');
  const detailsRef = useRef(null);

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
      pushToast('error', 'Failed to load ticket details', error?.response?.data?.message || '');
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
    
    // Auto-scroll to details if on mobile or if requested
    if (selectedRequestId && detailsRef.current) {
        const isMobile = window.innerWidth < 1536; // 2xl breakpoint
        if (isMobile) {
            detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  }, [selectedRequestId]);

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

  const handleAttachmentAction = async (attachment, mode) => {
    const key = `${attachment?.id || getAttachmentName(attachment)}-${mode}`;
    setAttachmentActionKey(key);
    try {
      if (mode === 'view') {
        await viewAttachment(attachment);
      } else {
        await downloadAttachment(attachment);
      }
    } catch (error) {
      pushToast('error', 'Attachment unavailable', error?.response?.data?.message || error?.message || '');
    } finally {
      setAttachmentActionKey('');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
      try {
          const payload = { status: newStatus };
          if (newStatus === 'RESOLVED') {
              const resolutionNotes = window.prompt('Enter resolution notes (optional):');
              if (resolutionNotes && resolutionNotes.trim()) {
                  payload.resolutionNotes = resolutionNotes.trim();
              }
          }
          const res = await api.patch(`/technician/tickets/${selectedRequest.id}/status`, payload);
          syncTicketState(res.data);
          pushToast('success', 'Status Updated', `Ticket is now ${newStatus}`);
      } catch (err) {
          pushToast('error', 'Update Failed', err?.response?.data?.message || 'Unauthorized');
      }
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
                  className={`cursor-pointer rounded-2xl border p-4 transition ${selectedRequestId === req.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-300'}`}
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

            <div ref={detailsRef} className="space-y-4">
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

                  <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800"><Clock size={14}/> SLA Metrics</p>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-blue-600">Response Due</p>
                          <p className="font-semibold text-blue-900 text-xs">{formatDateTime(selectedRequest.slaResponseDeadline)}</p>
                          <p className="mt-2 text-[11px] text-slate-500">Actual: {formatDateTimeOrFallback(selectedRequest.actualFirstResponseAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600">Resolution Due</p>
                          <p className="font-semibold text-blue-900 text-xs">{formatDateTime(selectedRequest.slaResolutionDeadline)}</p>
                          <p className="mt-2 text-[11px] text-slate-500">Actual: {formatDateTimeOrFallback(selectedRequest.actualResolutionAt)}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-blue-600">First Response Time</p>
                          <p className="font-semibold text-blue-900 text-xs">{formatDurationMinutes(selectedRequest.responseDurationMinutes)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600">Resolution Time</p>
                          <p className="font-semibold text-blue-900 text-xs">{formatDurationMinutes(selectedRequest.resolutionDurationMinutes)}</p>
                        </div>
                      </div>
                      <div className="mt-3 inline-block rounded bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-900 uppercase">
                        SLA: {selectedRequest.slaStatus?.replace(/_/g, ' ') || 'ACTIVE'}
                      </div>
                    </div>

                    <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">Workflow Control</p>
                        <div className="mt-3">
                            {selectedRequest.status === 'ASSIGNED' ? (
                                <button
                                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition"
                                >
                                    <PlayCircle size={18} />
                                    Start Work
                                </button>
                            ) : (
                                <select 
                                    value={selectedRequest.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    {INCIDENT_STATUS_OPTIONS.filter((status) => status.value !== 'REJECTED' && status.value !== 'OPEN').map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="mt-3 text-[10px] text-slate-400 font-medium italic text-center">
                            {selectedRequest.status === 'ASSIGNED' ? 'Begin the task to update the requester.' : 'Update status as you progress.'}
                        </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Preferred Contact</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{selectedRequest.preferredContact || 'Not provided'}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Created At</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{formatDateTime(selectedRequest.createdAt)}</p>
                        </div>
                  </div>

                  {/* Rejection Reason */}
                  {selectedRequest.status === 'REJECTED' && selectedRequest.rejectionReason && (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Rejection Reason</p>
                      <p className="mt-2 text-sm leading-6 text-rose-800 whitespace-pre-wrap">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}

                  {/* Resolution Notes */}
                  {selectedRequest.status === 'RESOLVED' && (selectedRequest.resolutionNotes || selectedRequest.resolutionSummary) && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolution Notes</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-800 whitespace-pre-wrap">{selectedRequest.resolutionNotes || selectedRequest.resolutionSummary}</p>
                    </div>
                  )}

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700"><Paperclip size={14}/> Attachments</p>
                    {selectedRequest.attachments?.length ? (
                      <div className="mt-3 space-y-3">
                        {selectedRequest.attachments.map((attachment, index) => (
                          <div
                            key={`${getAttachmentName(attachment)}-${index}`}
                            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 truncate max-w-[280px]" title={getAttachmentName(attachment)}>
                              <Paperclip size={14} className="text-slate-400 shrink-0" />
                              <span className="truncate">{getAttachmentName(attachment)}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={getViewerUrl(attachment) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 ${!attachment?.viewUrl ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
                              >
                                <Eye size={14} />
                                View
                              </a>
                              <button
                                type="button"
                                onClick={() => handleAttachmentAction(attachment, 'download')}
                                disabled={!attachment?.downloadUrl || attachmentActionKey === `${attachment?.id || getAttachmentName(attachment)}-download`}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">No attachments were uploaded for this ticket.</p>
                    )}
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-800"><MessageSquare size={16}/> Comments & Activity</h3>
                    <div className="mb-6 space-y-3">
                      {comments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          No comments have been added to this ticket yet.
                        </div>
                      ) : [...comments].reverse().map((comment) => (
                        <div key={comment.id} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-colors">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-700">{comment.authorName}</p>
                                {comment.authorRole === 'ADMIN' && (
                                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border border-indigo-200">Admin</span>
                                )}
                                <span className="font-normal text-slate-400 text-[10px]">({comment.authorRole})</span>
                                <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${comment.authorRole === 'USER' ? 'bg-blue-100 text-blue-800' : (comment.visibleToRequester ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600')}`}>
                                  {comment.authorRole === 'USER' ? 'Requester' : (comment.visibleToRequester ? 'External' : 'Internal')}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                {formatDateTime(getCommentCreatedAt(comment))}
                                {getCommentUpdatedAt(comment) && getCommentUpdatedAt(comment) !== getCommentCreatedAt(comment) ? ` • Edited` : ''}
                              </p>
                            </div>
                            {canManageComment(comment) && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {(comment.canEdit ?? true) && (
                                  <button onClick={() => beginEditing(comment)} className="p-1.5 text-blue-500 hover:bg-white rounded shadow-sm transition">
                                    <Edit2 size={12} />
                                  </button>
                                )}
                                {(comment.canDelete ?? true) && (
                                  <button onClick={() => handleDeleteComment(comment.id)} className="p-1.5 text-rose-500 hover:bg-white rounded shadow-sm transition">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{getCommentContent(comment)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm">
                      <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">{editingCommentId ? 'Edit Comment' : 'Add Progress Note'}</p>
                      <textarea
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-blue-300 focus:bg-white focus:outline-none transition-all resize-none"
                        placeholder="Describe your progress or ask the requester for details..."
                        rows={3}
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleToRequester}
                            onChange={(event) => setVisibleToRequester(event.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          Visible to Requester
                        </label>
                        <div className="flex gap-2">
                          {editingCommentId && (
                            <button onClick={resetComposer} className="rounded-xl px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 transition">
                              Cancel
                            </button>
                          )}
                          <button onClick={handleSaveComment} className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition">
                            {editingCommentId ? 'Update' : 'Post Update'}
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
