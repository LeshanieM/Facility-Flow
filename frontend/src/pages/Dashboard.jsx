import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import AdminOverviewDashboard from '../modules/admin-user-ui/components/AdminOverviewDashboard';
import api from '../services/api';
import { AlertCircle, CheckCircle2, Clock3, FolderKanban, RefreshCw, Wrench, Zap } from 'lucide-react';
import StatusBadge, { PriorityBadge, normalizeIncidentStatus } from '../modules/student-user-ui/components/StatusBadge';
import SurfaceCard from '../modules/student-user-ui/components/SurfaceCard';
import {
    AnalyticsSection,
    DistributionBar,
    KpiCard,
    buildPrioritySegments,
    buildStatusSegments,
} from '../modules/maintenance/components/DashboardAnalytics';

const formatTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
};

const TechnicianDashboard = () => {
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const loadTickets = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/technician/tickets');
            setTickets(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const analytics = React.useMemo(() => {
        const normalized = tickets.map((ticket) => ({
            ...ticket,
            normalizedStatus: normalizeIncidentStatus(ticket.status),
            normalizedPriority: String(ticket.priority || '').toUpperCase(),
        }));

        const highPrioritySet = new Set(['HIGH', 'URGENT', 'EMERGENCY']);
        const total = normalized.length;
        const openNotStarted = normalized.filter((ticket) => ['OPEN', 'ASSIGNED'].includes(ticket.normalizedStatus)).length;
        const inProgress = normalized.filter((ticket) => ticket.normalizedStatus === 'IN_PROGRESS').length;
        const resolved = normalized.filter((ticket) => ticket.normalizedStatus === 'RESOLVED').length;
        const highPriority = normalized.filter((ticket) => highPrioritySet.has(ticket.normalizedPriority)).length;

        const statusSegments = buildStatusSegments(normalized.map((ticket) => ({
            ...ticket,
            status: ticket.normalizedStatus,
        })));
        const prioritySegments = buildPrioritySegments(normalized.map((ticket) => ({
            ...ticket,
            priority: ticket.normalizedPriority,
        })));

        const recentTickets = [...normalized]
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 6);

        const needingAttention = [...normalized]
            .filter((ticket) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(ticket.normalizedStatus))
            .filter((ticket) => highPrioritySet.has(ticket.normalizedPriority))
            .sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt))
            .slice(0, 6);

        return {
            total,
            openNotStarted,
            inProgress,
            resolved,
            highPriority,
            statusSegments,
            prioritySegments,
            recentTickets,
            needingAttention,
        };
    }, [tickets]);

    const quickLinks = [
        { label: 'View My Assigned Tickets', to: '/tech/tasks?tab=tickets&focus=all', icon: <FolderKanban size={16} /> },
        { label: 'View In Progress Tickets', to: '/tech/tasks?tab=tickets&focus=in-progress', icon: <Wrench size={16} /> },
        { label: 'View High Priority Tickets', to: '/tech/tasks?tab=tickets&focus=high-priority', icon: <AlertCircle size={16} /> },
        { label: 'View Recently Updated', to: '/tech/tasks?tab=tickets&focus=recent', icon: <Clock3 size={16} /> },
        { label: 'View Not Yet Started', to: '/tech/tasks?tab=tickets&focus=not-started', icon: <Zap size={16} /> },
        { label: 'Resume Work', to: '/tech/tasks?tab=tickets&focus=resume', icon: <CheckCircle2 size={16} /> },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Technician Dashboard</p>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Your workload snapshot</h3>
                    <p className="text-sm text-slate-500">Live overview of tickets currently assigned to you.</p>
                </div>
                <button
                    onClick={loadTickets}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                <KpiCard icon={<FolderKanban size={18} />} label="Total Assigned Tickets" value={analytics.total} accent="blue" />
                <KpiCard icon={<Clock3 size={18} />} label="Open / Not Started" value={analytics.openNotStarted} accent="amber" />
                <KpiCard icon={<Wrench size={18} />} label="In Progress" value={analytics.inProgress} accent="orange" />
                <KpiCard icon={<CheckCircle2 size={18} />} label="Resolved" value={analytics.resolved} accent="emerald" />
                <KpiCard icon={<AlertCircle size={18} />} label="High Priority" value={analytics.highPriority} accent="rose" />
            </div>

            <AnalyticsSection>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Quick Access</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50/40"
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </div>
            </AnalyticsSection>

            <AnalyticsSection>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <DistributionBar title="Workload by Status" segments={analytics.statusSegments} />
                    <DistributionBar title="Workload by Priority" segments={analytics.prioritySegments} />
                </div>
            </AnalyticsSection>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SurfaceCard className="p-6 sm:p-7">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Recent Assigned / Activity</h4>
                    {isLoading ? (
                        <p className="text-sm text-slate-400">Loading recent tickets...</p>
                    ) : analytics.recentTickets.length === 0 ? (
                        <p className="text-sm text-slate-400">No recent updates.</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.recentTickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{ticket.title}</p>
                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{ticket.ticketId || 'No ticket ID'}</p>
                                        </div>
                                        <Link to={`/tech/tasks?tab=tickets&focus=all`} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                                            Open
                                        </Link>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <StatusBadge status={ticket.normalizedStatus} />
                                        <PriorityBadge priority={ticket.priority} />
                                        <span className="text-[10px] font-semibold text-slate-400">{formatTime(ticket.updatedAt || ticket.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SurfaceCard>

                <SurfaceCard className="p-6 sm:p-7">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Tickets Requiring Attention</h4>
                    {isLoading ? (
                        <p className="text-sm text-slate-400">Loading high-priority unresolved tickets...</p>
                    ) : analytics.needingAttention.length === 0 ? (
                        <p className="text-sm text-slate-400">No high or urgent unresolved tickets.</p>
                    ) : (
                        <div className="space-y-3">
                            {analytics.needingAttention.map((ticket) => (
                                <div key={ticket.id} className="rounded-xl border border-amber-100 bg-amber-50/40 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm font-bold text-slate-800 truncate">{ticket.title}</p>
                                        <Link to={`/tech/tasks?tab=tickets&focus=all`} className="text-xs font-bold text-amber-700 hover:text-amber-800">
                                            View
                                        </Link>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <StatusBadge status={ticket.normalizedStatus} />
                                        <PriorityBadge priority={ticket.priority} />
                                        <span className="text-[10px] font-semibold text-slate-500">Last update: {formatTime(ticket.updatedAt || ticket.createdAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SurfaceCard>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const isTechnician = user?.role === 'TECHNICIAN';
    const firstName = String(user?.name || user?.email || user?.sub || 'there')
        .trim()
        .split(' ')[0]
        .split('@')[0];

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in text-slate-900">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            Welcome, <span className="text-primary">{firstName}</span>
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Here is your campus operations overview.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-2 shadow-sm">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                            System Live
                        </div>
                    </div>
                </div>

                {isAdmin && <AdminOverviewDashboard />}
                {isTechnician && <TechnicianDashboard />}
            </div>
        </Layout>
    );
};

export default Dashboard;
