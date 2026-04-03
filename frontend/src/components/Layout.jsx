import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LogOut, Bell, Search, Menu as MenuIcon } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-slate-800 hidden md:block">
               {user?.role === 'ADMIN' ? 'Control Center' : 'Campus Hub'}
            </h1>
            
            <div className="relative group w-64 md:w-80">
              <Search 
                size={18} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" 
              />
              <input 
                type="text" 
                placeholder="Search facilities or tasks..." 
                className="w-full pl-11 pr-4 py-2 bg-slate-100/50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

        <footer className="py-6 px-8 bg-white border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 font-medium italic">
                Facility Flow © 2026 • Optimized for University Operations
            </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
