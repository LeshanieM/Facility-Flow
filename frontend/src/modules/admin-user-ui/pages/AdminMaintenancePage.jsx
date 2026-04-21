import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../components/Layout';
import { useAdminMaintenanceDashboard } from '../hooks/useAdminMaintenanceDashboard';
import { BellRing, CheckCircle, Clock, AlertCircle, RefreshCw, Filter, MonitorPlay, X, User as UserIcon, Calendar, MapPin, Paperclip, Eye, Download } from 'lucide-react';
import { formatDateTime, formatDateTimeOrFallback, formatDurationMinutes } from '../../maintenance/utils/dateTime';
import { downloadAttachment, getAttachmentName, viewAttachment, getViewerUrl } from '../../maintenance/utils/attachmentActions';
import StatusBadge, { INCIDENT_STATUS_OPTIONS, formatIncidentStatusLabel } from '../../student-user-ui/components/StatusBadge';
const getCommentContent = (comment) => comment?.content || comment?.message || '';
const getCommentCreatedAt = (comment) => comment?.createdAt || comment?.timestamp || null;
const getCommentUpdatedAt = (comment) => comment?.updatedAt || comment?.editedAt || null;

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'EMERGENCY': return 'bg-rose-500';
        case 'HIGH': return 'bg-orange-500';
        case 'MEDIUM': return 'bg-amber-500';
        case 'LOW': return 'bg-emerald-500';
        default: return 'bg-slate-300';
    }
};

export const AdminMaintenancePage = () => {
    const { tickets, technicians, isLoading, error, changeStatus, assignTicket, refreshTickets } = useAdminMaintenanceDashboard();
    const [filter, setFilter] = useState('ALL');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [pendingTechAssignment, setPendingTechAssignment] = useState('');
    const [pendingStatus, setPendingStatus] = useState('');
    const [attachmentActionKey, setAttachmentActionKey] = useState('');
    const styleRef = useRef(null);

    useEffect(() => {
        const styleEl = document.createElement("style");
        styleEl.textContent = `
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes glow-pulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.2); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
        `;
        document.head.appendChild(styleEl);
        styleRef.current = styleEl;
        return () => document.head.removeChild(styleEl);
    }, []);

    const filteredTickets = tickets
        .filter(t => filter === 'ALL' || t.status === filter)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleQuickAction = (e, ticketId, newStatus) => {
        e.stopPropagation(); // prevent modal from opening
        changeStatus(ticketId, { status: newStatus });
    };

    const handleSave = async () => {
        let hasChanges = false;
        
        if (pendingTechAssignment) {
            assignTicket(selectedTicket.id, pendingTechAssignment);
            hasChanges = true;
        }
        
        if (pendingStatus && pendingStatus !== selectedTicket.status) {
            const payload = { status: pendingStatus };
            if (pendingStatus === 'REJECTED') {
                const rejectionReason = window.prompt('Enter the rejection reason for this ticket:');
                if (!rejectionReason || !rejectionReason.trim()) {
                    return;
                }
                payload.rejectionReason = rejectionReason.trim();
            }

            if (pendingStatus === 'RESOLVED') {
                const resolutionNotes = window.prompt('Enter resolution notes (optional):');
                if (resolutionNotes && resolutionNotes.trim()) {
                    payload.resolutionNotes = resolutionNotes.trim();
                }
            }

            const updated = await changeStatus(selectedTicket.id, payload);
            if (updated) {
                setSelectedTicket(updated);
            }
            hasChanges = true;
        }
        
        if (hasChanges) {
            setSelectedTicket(null);
            setPendingTechAssignment('');
            setPendingStatus('');
        }
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
            alert(error?.response?.data?.message || error?.message || 'Unable to open the attachment.');
        } finally {
            setAttachmentActionKey('');
        }
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in relative min-h-screen text-slate-800 -m-8 p-8 overflow-hidden bg-slate-50">
                {/* Background Blobs for Epic aesthetic */}
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none animate-[float-slow_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[40%] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none animate-[float-slow_12s_ease-in-out_infinite_reverse]" />
                <div className="absolute top-[20%] right-[10%] w-[25%] h-[30%] bg-purple-400/15 rounded-full blur-[100px] pointer-events-none animate-[glow-pulse_6s_ease-in-out_infinite]" />

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">Incident Ticketing Monitor</h1>
                        <p className="text-slate-600 font-medium">Oversee all campus facility breakdowns and map technicians to workflow requests.</p>
                    </div>
                </div>

                {/* Dashboard Datatable */}
                <div className="glass-card overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 bg-white/60 backdrop-blur-xl rounded-[24px] relative z-10">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/40">
                        <div className="flex items-center gap-2">
                            <MonitorPlay className="text-slate-400" size={18} />
                            <span className="font-bold text-slate-700 text-sm">Global Filter:</span>
                            <select 
                                className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-600"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="ALL">All Incidents</option>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                        <button onClick={refreshTickets} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            Refresh Console
                        </button>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto min-h-[400px]">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-4">
                                <RefreshCw className="animate-spin text-primary" size={32} />
                                <p className="font-bold">Syncing incident database...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-20 text-rose-500 space-y-3 bg-rose-50/30">
                                <AlertCircle size={40} />
                                <p className="font-bold">{error}</p>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400 space-y-3">
                                <CheckCircle size={48} className="text-emerald-400 opacity-50" />
                                <p className="font-black text-xl text-slate-600">No tickets found</p>
                                <p className="text-sm font-medium">The campus queue is currently clear.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">ID / Priority</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Title & Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Submitted By</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Current Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Quick Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/50">
                                    {filteredTickets.map(ticket => (
                                        <tr 
                                            key={ticket.id} 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="hover:bg-white/80 transition-all duration-300 group cursor-pointer hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 relative z-10"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-10 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                                                    <div>
                                                        <div className="font-black text-slate-800 tracking-tight">{ticket.ticketId}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.priority}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="font-bold text-slate-900 truncate mb-1">{ticket.title}</div>
                                                <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                                                    <span className="bg-slate-100 text-slate-600 px-2 rounded font-semibold text-[10px] uppercase tracking-wider">{ticket.category}</span>
                                                    {ticket.location} {ticket.room ? `- ${ticket.room}` : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700">{ticket.submittedByName || 'Unknown'}</div>
                                                <div className="text-xs text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={ticket.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {ticket.status === 'OPEN' && (
                                                    <button 
                                                        onClick={(e) => handleQuickAction(e, ticket.id, 'IN_PROGRESS')}
                                                        className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:scale-105 transition-all"
                                                    >
                                                        Review & Start
                                                    </button>
                                                )}
                                                {ticket.status === 'IN_PROGRESS' && (
                                                    <button 
                                                        onClick={(e) => handleQuickAction(e, ticket.id, 'RESOLVED')}
                                                        className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-600/20 hover:scale-105 transition-all"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}
                                                {(ticket.status === 'RESOLVED' || ticket.status === 'REJECTED' || ticket.status === 'CLOSED') && (
                                                    <span className="text-xs font-bold text-slate-400">Read Only</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Details & Assignment Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl w-full max-w-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col max-h-[90vh]">
                            
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-200/50 flex items-start justify-between bg-white/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} PRIORITY
                                        </span>
                                        <StatusBadge status={selectedTicket.status} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTicket.title}</h2>
                                    <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                                        Tracker: <span className="text-primary">{selectedTicket.ticketId}</span>
                                    </p>
                                </div>
                                <button 
                                                    onClick={() => { setSelectedTicket(null); setPendingTechAssignment(''); setPendingStatus(''); }}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                >
                                                    <X size={20} className="stroke-[3]" />
                                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-8 py-6 overflow-y-auto space-y-8 flex-1">
                                
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</div>
                                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis px-1">{selectedTicket.category.replace('_', ' ')}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10}/> Location</div>
                                        <div className="font-bold text-slate-800 text-sm flex gap-1 whitespace-nowrap overflow-hidden text-ellipsis px-1">
                                            {selectedTicket.location} {selectedTicket.room && <span className="text-primary">{selectedTicket.room}</span>}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><UserIcon size={10}/> Requester</div>
                                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis px-1">{selectedTicket.submittedByName}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10}/> Created Date</div>
                                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis px-1">{new Date(selectedTicket.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-inner">
                                    <div className="mb-4 flex items-center gap-2 text-blue-900">
                                        <Clock size={18} />
                                        <h3 className="text-sm font-black uppercase tracking-widest">SLA Overview</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div className="rounded-xl border border-blue-100 bg-white/80 p-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Response Target</div>
                                            <div className="text-sm font-bold text-blue-900">{formatDateTime(selectedTicket.slaResponseDeadline)}</div>
                                            <div className="mt-2 text-xs text-slate-500">Actual: {formatDateTimeOrFallback(selectedTicket.actualFirstResponseAt)}</div>
                                        </div>
                                        <div className="rounded-xl border border-blue-100 bg-white/80 p-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Resolution Target</div>
                                            <div className="text-sm font-bold text-blue-900">{formatDateTime(selectedTicket.slaResolutionDeadline)}</div>
                                            <div className="mt-2 text-xs text-slate-500">Actual: {formatDateTimeOrFallback(selectedTicket.actualResolutionAt)}</div>
                                        </div>
                                        <div className="rounded-xl border border-blue-100 bg-white/80 p-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">First Response Time</div>
                                            <div className="text-sm font-bold text-blue-900">{formatDurationMinutes(selectedTicket.responseDurationMinutes)}</div>
                                        </div>
                                        <div className="rounded-xl border border-blue-100 bg-white/80 p-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Resolution Time</div>
                                            <div className="text-sm font-bold text-blue-900">{formatDurationMinutes(selectedTicket.resolutionDurationMinutes)}</div>
                                            <div className="mt-2 inline-block rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                                                {selectedTicket.slaStatus ? selectedTicket.slaStatus.replace(/_/g, ' ') : 'SLA ACTIVE'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest">Full Description</h3>
                                    <p className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed border border-slate-100 whitespace-pre-wrap">
                                        {selectedTicket.description || 'No detailed description provided by the user.'}
                                    </p>
                                </div>

                                {/* Rejection Reason */}
                                {selectedTicket.status === 'REJECTED' && selectedTicket.rejectionReason && (
                                    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
                                        <h3 className="text-sm font-black text-rose-700 mb-2 uppercase tracking-widest">Rejection Reason</h3>
                                        <p className="text-sm leading-relaxed text-rose-800 whitespace-pre-wrap">{selectedTicket.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Resolution Notes */}
                                {selectedTicket.status === 'RESOLVED' && (selectedTicket.resolutionNotes || selectedTicket.resolutionSummary) && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                                        <h3 className="text-sm font-black text-emerald-700 mb-2 uppercase tracking-widest">Resolution Notes</h3>
                                        <p className="text-sm leading-relaxed text-emerald-800 whitespace-pre-wrap">{selectedTicket.resolutionNotes || selectedTicket.resolutionSummary}</p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest">Attachments</h3>
                                    {selectedTicket.attachments?.length ? (
                                        <div className="space-y-3">
                                            {selectedTicket.attachments.map((attachment, index) => (
                                                <div
                                                    key={`${getAttachmentName(attachment)}-${index}`}
                                                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                                        <Paperclip size={14} className="text-slate-400" />
                                                        <span>{getAttachmentName(attachment)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={getViewerUrl(attachment) || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 ${!attachment?.viewUrl ? 'cursor-not-allowed opacity-50 pointer-events-none' : ''}`}
                                                        >
                                                            <Eye size={14} />
                                                            View
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAttachmentAction(attachment, 'download')}
                                                            disabled={!attachment?.downloadUrl || attachmentActionKey === `${attachment?.id || getAttachmentName(attachment)}-download`}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Download size={14} />
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                            No attachments were uploaded for this ticket.
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest">Comment Monitor</h3>
                                    {selectedTicket.comments?.length ? (
                                        <div className="space-y-3">
                                            {selectedTicket.comments.map((comment) => (
                                                <div key={comment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">
                                                                {comment.authorName}
                                                                <span className="ml-1 font-normal text-slate-500">({comment.authorRole})</span>
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Created {formatDateTime(getCommentCreatedAt(comment))}
                                                                {getCommentUpdatedAt(comment) && getCommentUpdatedAt(comment) !== getCommentCreatedAt(comment) ? ` • Updated ${formatDateTime(getCommentUpdatedAt(comment))}` : ''}
                                                            </p>
                                                        </div>
                                                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${comment.authorRole === 'USER' ? 'bg-blue-100 text-blue-700' : (comment.visibleToRequester ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}`}>
                                                            {comment.authorRole === 'USER' ? 'Requester added' : (comment.visibleToRequester ? 'Requester Visible' : 'Internal')}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                        {getCommentContent(comment)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                            No comments have been added to this ticket yet.
                                        </div>
                                    )}
                                </div>

                                {/* Admin Controls */}
                                <div className="bg-white border-2 border-indigo-50/50 shadow-[0_0_40px_-10px_rgba(79,70,229,0.1)] p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Technician Allocation</h3>
                                            <select 
                                                className={`w-full ${(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50'} border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-bold transition-all`}
                                                value={pendingTechAssignment || technicians.find(t => t.name === selectedTicket.assignedTechnicianName)?.id || ''}
                                                onChange={(e) => setPendingTechAssignment(e.target.value)}
                                                disabled={selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED'}
                                            >
                                                <option value="" disabled>Select a Campus Technician...</option>
                                                {technicians.map(tech => (
                                                    <option key={tech.id} value={tech.id}>{tech.name} ({tech.email})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Manual Status Override</h3>
                                            <select 
                                                className={`w-full ${selectedTicket.status === 'CLOSED' ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50'} border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-bold transition-all`}
                                                value={pendingStatus || selectedTicket.status}
                                                onChange={(e) => setPendingStatus(e.target.value)}
                                                disabled={selectedTicket.status === 'CLOSED'}
                                            >
                                                {INCIDENT_STATUS_OPTIONS.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.value === 'CLOSED' ? 'Closed / Archive' : formatIncidentStatusLabel(status.value)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleSave}
                                        disabled={!pendingTechAssignment && (!pendingStatus || pendingStatus === selectedTicket.status)}
                                        className="w-full bg-indigo-600 text-white text-sm font-bold py-3 rounded-xl disabled:opacity-50 transition-all hover:bg-indigo-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default AdminMaintenancePage;
