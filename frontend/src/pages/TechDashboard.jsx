import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const TechDashboard = () => {
    const { user } = useAuth();

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in text-slate-900">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Technician Console</h1>
                        <p className="text-slate-500 font-medium">Hello, <span className="text-primary font-bold">{user?.sub?.split('@')[0]}</span>. Your operations workstation is ready.</p>
                    </div>
                </div>

                {/* Content Area (Currently Clean) */}
                <div className="min-h-[400px]">
                    {/* Future operational modules can be mapped here */}
                </div>
            </div>
        </Layout>
    );
};

export default TechDashboard;
