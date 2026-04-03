import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in text-slate-900">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            Welcome back, <span className="text-primary">{user?.sub?.split('@')[0]}</span>!
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

                {/* Content Area (Currently Clean) */}
                <div className="grid grid-cols-1 gap-8 opacity-0">
                    {/* Future modules can be added here */}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
