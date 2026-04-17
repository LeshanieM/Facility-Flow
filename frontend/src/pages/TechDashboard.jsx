import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import { ClipboardList, Clock, CheckCircle, MapPin, X, AlertCircle } from 'lucide-react';

const TechDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/technician/tickets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
            
            // Update selected task in modal if it's open
            if (selectedTask) {
                const updated = res.data.find(t => t.id === selectedTask.id);
                if (updated) setSelectedTask(updated);
            }
        } catch (error) {
            console.error('Failed to fetch assigned tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/technician/tickets/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks(); // refresh
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
            case 'RESOLVED': 
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
            case 'BLOCKED': return 'bg-red-100 text-red-800';
            case 'CLOSED': return 'bg-slate-100 text-slate-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in text-slate-900 relative">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Technician Console</h1>
                        <p className="text-slate-500 font-medium">Hello, <span className="text-primary font-bold">{user?.sub?.split('@')[0]}</span>. Your operations workstation is ready.</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex animate-pulse space-x-4">
                            <div className="flex-1 space-y-6 py-1">
                                <div className="h-2 rounded bg-slate-200"></div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 h-2 rounded bg-slate-200"></div>
                                        <div className="col-span-1 h-2 rounded bg-slate-200"></div>
                                    </div>
                                    <div className="h-2 rounded bg-slate-200"></div>
                                </div>
                            </div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500 border-2 border-dashed border-slate-200 rounded-3xl">
                            <CheckCircle className="w-16 h-16 mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-700">All Caught Up!</h3>
                            <p className="mt-2 text-center text-slate-500 max-w-sm">
                                You currently have no tasks assigned to you. Enjoy your downtime or check back later!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tasks.map(task => (
                                <div key={task.id} className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col pt-12 text-slate-800">
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-widest ${getStatusColor(task.status)} font-medium`}>
                                        {task.status.replace(/_/g, ' ')}
                                    </div>
                                    <div className="absolute top-4 left-4 flex items-center justify-center p-2 bg-slate-50 rounded-xl text-slate-500 border border-slate-100">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    
                                    <h3 className="text-lg font-bold truncate mt-2">{task.title}</h3>
                                    <p className="text-slate-500 text-sm mt-1 line-clamp-2 min-h-[40px] leading-relaxed">{task.description}</p>
                                    
                                    <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{task.location}</span>
                                            {task.room && <span className="text-slate-400">({task.room})</span>}
                                        </div>
                                        <div className="flex items-center gap-2 font-mono text-xs">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{task.category}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 flex gap-3">
                                        <button 
                                            onClick={() => setSelectedTask(task)}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                                        >
                                            View Details
                                        </button>
                                        {(task.status === 'OPEN' || task.status === 'ASSIGNED') && (
                                            <button 
                                                onClick={() => updateStatus(task.id, 'IN_PROGRESS')}
                                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm shadow-amber-500/20"
                                            >
                                                Start Work
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-slate-100 flex flex-col max-h-[90vh]">
                            
                            <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedTask.status)}`}>
                                            {selectedTask.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-700">
                                            {selectedTask.priority} PRIORITY
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTask.title}</h2>
                                    <p className="text-sm font-semibold text-slate-500 mt-1">Ticket ID: {selectedTask.ticketId}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedTask(null)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                >
                                    <X size={20} className="stroke-[3]" />
                                </button>
                            </div>

                            <div className="px-8 py-6 overflow-y-auto space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</div>
                                        <div className="font-bold text-slate-800 text-sm">{selectedTask.category}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</div>
                                        <div className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                            {selectedTask.location} {selectedTask.room ? `- ${selectedTask.room}` : ''}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requester</div>
                                        <div className="font-bold text-slate-800 text-sm">{selectedTask.submittedByName || 'Unknown'}</div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</div>
                                        <div className="font-bold text-slate-800 text-sm">
                                            {new Date(selectedTask.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">Full Description</h3>
                                    <p className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm leading-relaxed border border-slate-100 whitespace-pre-wrap">
                                        {selectedTask.description || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Technician Action Controls */}
                                <div className="border-t border-slate-100 pt-6 mt-6">
                                    <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest text-center">Update Work Status</h3>
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        {(selectedTask.status === 'OPEN' || selectedTask.status === 'ASSIGNED' || selectedTask.status === 'BLOCKED') && (
                                            <button 
                                                onClick={() => updateStatus(selectedTask.id, 'IN_PROGRESS')}
                                                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                                            >
                                                <AlertCircle size={18} />
                                                Start / Resume Work
                                            </button>
                                        )}
                                        {selectedTask.status === 'IN_PROGRESS' && (
                                            <>
                                                <button 
                                                    onClick={() => updateStatus(selectedTask.id, 'BLOCKED')}
                                                    className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-md"
                                                >
                                                    Mark Blocked
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(selectedTask.id, 'COMPLETED')}
                                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={18} />
                                                    Mark Completed
                                                </button>
                                            </>
                                        )}
                                        {(selectedTask.status === 'COMPLETED' || selectedTask.status === 'RESOLVED' || selectedTask.status === 'CLOSED' || selectedTask.status === 'REJECTED') && (
                                            <div className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 w-full max-w-xs cursor-not-allowed">
                                                No further actions available
                                            </div>
                                        )}
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

export default TechDashboard;

