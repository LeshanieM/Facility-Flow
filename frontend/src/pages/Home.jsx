import React from 'react';
import { LogIn, GraduationCap, Building, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans select-none">
            {/* --- Top Header Navigation --- */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                        F
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                            {user?.role === 'ADMIN' ? 'Control Center' : 'Campus Hub'}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(user ? '/dashboard' : '/login')}
                        className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                    >
                        {user ? 'Go to Dashboard' : 'Sign In'}
                    </button>
                </div>
            </header>

            {/* --- Background Decorative Elements --- */}
            <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            
            {/* --- Main Content --- */}
            <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Side: Copy and CTA */}
                <div className="space-y-8 max-w-xl animate-fade-in">
                    <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
                        Discover your <br />
                        <span className="text-blue-600">campus hub</span>
                    </h1>
                    
                    <p className="text-slate-500 text-lg leading-relaxed max-w-md font-medium">
                        Access university facilities, from collaborative study pods to cutting-edge research labs. Your intelligent portal for a connected campus experience.
                    </p>

                    <button 
                        onClick={() => navigate('/login')}
                        className="group relative px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center gap-3"
                    >
                        Login to Portal
                        <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Right Side: University Image */}
                <div className="relative flex justify-center items-center animate-fade-in">
                    <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/50 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <img 
                            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                            alt="Modern University Campus" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"></div>
                    </div>

                    {/* Floating elements to keep some dynamic style */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full blur-[20px] opacity-40 animate-pulse" />
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500 rounded-full blur-[30px] opacity-20" />
                </div>
            </main>

            {/* --- Footer Cards --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: GraduationCap, title: "Academic Life", text: "Access course schedules, grades, and essential academic resources seamlessly." },
                        { icon: Building, title: "Campus Facilities", text: "Book study rooms, advanced sports arenas, and dedicated event spaces." },
                        { icon: Users, title: "Student Community", text: "Connect with peers, join diverse campus clubs, and attend local events." },
                        { icon: BookOpen, title: "Digital Library", text: "Explore millions of global research papers, curated journals, and books." }
                    ].map((card, idx) => (
                        <div key={idx} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <card.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-800">{card.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {card.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(2deg); }
                    50% { transform: translateY(-10px) rotate(1deg); }
                }
            ` }} />
        </div>
    );
};

export default Home;
