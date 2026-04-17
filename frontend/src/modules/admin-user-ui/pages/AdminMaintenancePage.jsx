import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import { useAdminMaintenanceDashboard } from '../hooks/useAdminMaintenanceDashboard';
import { BellRing, CheckCircle, Clock, AlertCircle, RefreshCw, Filter, MonitorPlay, X, User as UserIcon, Calendar, MapPin } from 'lucide-react';

const getStatusBadge = (status) => {
    switch(status) {
        case 'OPEN': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Open</span>;
        case 'IN_PROGRESS': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase">In Progress</span>;
        case 'RESOLVED': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Resolved</span>;
        case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Completed</span>;
        case 'BLOCKED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Blocked</span>;
        case 'CLOSED': return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase">Closed</span>;
        case 'REJECTED': return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Rejected</span>;
        default: return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'CRITICAL': return 'bg-rose-500';
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

    const filteredTickets = tickets.filter(t => filter === 'ALL' || t.status === filter);

    const handleQuickAction = (e, ticketId, newStatus) => {
        e.stopPropagation(); // prevent modal from opening
        changeStatus(ticketId, newStatus);
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket(prev => ({ ...prev, status: newStatus }));
        }
    };

    const handleAssign = (technicianId) => {
        if (!technicianId) return;
        assignTicket(selectedTicket.id, technicianId);
        setSelectedTicket(prev => ({ ...prev, assignedTechnicianName: technicians.find(t=>t.id===technicianId)?.name }));
    };

    const handleModalStatusChange = (e) => {
        handleQuickAction(e, selectedTicket.id, e.target.value);
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in relative">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Incident Ticketing Monitor</h1>
                        <p className="text-slate-500 font-medium">Oversee all campus facility breakdowns and map technicians to workflow requests.</p>
                    </div>
                </div>

                {/* Dashboard Datatable */}
                <div className="glass-card overflow-hidden shadow-xl shadow-slate-200/50 border-slate-200/60 bg-white">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
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
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTickets.map(ticket => (
                                        <tr 
                                            key={ticket.id} 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
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
                                                {getStatusBadge(ticket.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {ticket.status === 'OPEN' && (
                                                    <button 
                                                        onClick={(e) => handleQuickAction(e, ticket.id, 'IN_PROGRESS')}
                                                        className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:scale-105 transition-all"
                                                    >
                                                        Mark In Progress
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
                        <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
                            
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority} PRIORITY
                                        </span>
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTicket.title}</h2>
                                    <p className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                                        Tracker: <span className="text-primary">{selectedTicket.ticketId}</span>
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedTicket(null)}
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

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest">Full Description</h3>
                                    <p className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm leading-relaxed border border-slate-100 whitespace-pre-wrap">
                                        {selectedTicket.description || 'No detailed description provided by the user.'}
                                    </p>
                                </div>

                                {/* Admin Controls */}
                                <div className="bg-white border-2 border-indigo-50/50 shadow-[0_0_40px_-10px_rgba(79,70,229,0.1)] p-6 rounded-2xl flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Technician Allocation</h3>
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-bold transition-all"
                                            value={technicians.find(t => t.name === selectedTicket.assignedTechnicianName)?.id || ''}
                                            onChange={(e) => handleAssign(e.target.value)}
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
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-bold transition-all"
                                            value={selectedTicket.status}
                                            onChange={handleModalStatusChange}
                                        >
                                            <option value="OPEN">Keep Open</option>
                                            <option value="IN_PROGRESS">Force In Progress</option>
                                            <option value="RESOLVED">Mark Resolved</option>
                                            <option value="BLOCKED">Mark Blocked</option>
                                            <option value="COMPLETED">Mark Completed</option>
                                            <option value="CLOSED">Archive / Close</option>
                                            <option value="REJECTED">Reject Request</option>
                                        </select>
                                    </div>
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
