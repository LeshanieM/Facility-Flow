import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ShieldCheck, 
  Hammer, 
  CircleUser,
  History,
  Map,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { user } = useAuth();
    const location = useLocation();

    const menuItems = {
        ADMIN: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
            { name: 'Users', icon: <Users size={20} />, path: '/admin' },
            { name: 'Logs', icon: <History size={20} />, path: '/logs' },
            { name: 'Security', icon: <ShieldCheck size={20} />, path: '/security' },
        ],
        USER: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
            { name: 'Bookings', icon: <Calendar size={20} />, path: '/bookings' },
            { name: 'Map', icon: <Map size={20} />, path: '/map' },
            { name: 'Profile', icon: <CircleUser size={20} />, path: '/profile' },
        ],
        TECHNICIAN: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
            { name: 'Tasks', icon: <Hammer size={20} />, path: '/tech/tasks' },
            { name: 'History', icon: <History size={20} />, path: '/history' },
            { name: 'Profile', icon: <CircleUser size={20} />, path: '/profile' },
        ]
    };

    const currentMenu = menuItems[user?.role] || menuItems.USER;

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-slate-950 text-slate-300 transition-all duration-300 ease-in-out z-50 flex flex-col border-r border-white/10 shadow-2xl ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Brand Header */}
            <div className="p-6 border-b border-white/5 relative group">
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 shrink-0">
                        F
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in whitespace-nowrap">
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FACILITY</h2>
                            <p className="text-[10px] tracking-[0.2em] text-primary font-bold">FLOW SYSTEM</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-3">
                {currentMenu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium group relative overflow-hidden ${
                                isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            } ${isCollapsed ? 'justify-center p-0 h-12 w-12 mx-auto' : ''}`}
                        >
                            <span className={`shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                            {isActive && !isCollapsed && (
                                <div className="absolute right-0 top-0 h-full w-1.5 bg-white/20 rounded-l-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
                <div className={`flex items-center gap-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center font-bold text-primary shrink-0 relative group">
                        {user?.sub?.[0].toUpperCase()}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 animate-fade-in">
                            <div className="text-sm font-semibold text-white truncate">{user?.sub?.split('@')[0]}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{user?.role}</div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Collapse Toggle (Custom UI) */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-slate-900 hover:scale-110 transition-transform z-[60]"
            >
                {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
            </button>
        </aside>
    );
};

export default Sidebar;
