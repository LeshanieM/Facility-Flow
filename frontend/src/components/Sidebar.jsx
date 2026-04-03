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
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Users', icon: <Users size={20} />, path: '/admin' },
            { name: 'Logs', icon: <History size={20} />, path: '/logs' },
            { name: 'Security', icon: <ShieldCheck size={20} />, path: '/security' },
        ],
        USER: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Bookings', icon: <Calendar size={20} />, path: '/bookings' },
            { name: 'Map', icon: <Map size={20} />, path: '/map' },
            { name: 'Profile', icon: <CircleUser size={20} />, path: '/profile' },
        ],
        TECHNICIAN: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
            { name: 'Tasks', icon: <Hammer size={20} />, path: '/tech/tasks' },
            { name: 'History', icon: <History size={20} />, path: '/history' },
            { name: 'Profile', icon: <CircleUser size={20} />, path: '/profile' },
        ]
    };

    const currentMenu = menuItems[user?.role] || menuItems.USER;

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-white text-slate-600 font-sans transition-all duration-300 ease-in-out z-50 flex flex-col border-r border-slate-200 shadow-xl shadow-slate-200/40 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Brand Header */}
            <div className="p-6 border-b border-slate-100 bg-white relative group">
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 shrink-0 group-hover:shadow-blue-500/50 transition-all">
                        F
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in whitespace-nowrap">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">CAMPUS HUB</h2>
                            <p className="text-[10px] tracking-widest text-blue-600 font-bold uppercase">Space Booking</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 space-y-2 overflow-y-auto px-4 bg-slate-50/50">
                {currentMenu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                                isActive 
                                ? 'bg-white text-blue-700 shadow-md shadow-slate-200/50 border border-slate-100' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:shadow-sm'
                            } ${isCollapsed ? 'justify-center p-0 h-12 w-12 mx-auto' : ''}`}
                        >
                            <span className={`shrink-0 transition-transform duration-300 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:scale-110 group-hover:text-blue-500'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                            {isActive && !isCollapsed && (
                                <div className="absolute right-0 top-0 h-full w-1.5 bg-blue-600 rounded-l-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Summary */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <div className={`flex items-center gap-4 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 relative group shadow-sm">
                        {user?.sub?.[0].toUpperCase()}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 animate-fade-in">
                            <div className="text-sm font-bold text-slate-800 truncate">{user?.sub?.split('@')[0]}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Collapse Toggle (Custom UI) */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-md border border-slate-200 hover:scale-110 hover:text-blue-600 transition-all z-[60]"
            >
                {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
            </button>
        </aside>
    );
};

export default Sidebar;
