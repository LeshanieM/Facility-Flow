import React from 'react';
import { LogIn } from 'lucide-react';
import CONFIG from '../config';

const Login = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${CONFIG.AUTH_BASE_URL}/oauth2/authorization/google`;
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center relative overflow-hidden font-sans">
            {/* Background Decorative Gradients */}
            <div className="absolute top-0 -left-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 -right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
            
            <div className="w-full max-w-md p-8 relative z-10 animate-fade-in px-4">
                {/* Branding */}
                <div className="text-center mb-10 space-y-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark mx-auto rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/40 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        F
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Facility Flow</h1>
                    <p className="text-slate-500 font-medium text-sm tracking-widest uppercase">Smart Campus Operations</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-10 bg-white/80 backdrop-blur-2xl border-white shadow-2xl shadow-slate-200/50">
                    <div className="space-y-6 text-center">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                            <p className="text-sm text-slate-400 font-medium">Please sign in with your university account.</p>
                        </div>

                        <button 
                            onClick={handleGoogleLogin} 
                            className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-primary/50 hover:bg-slate-50 rounded-2xl font-bold text-slate-700 transition-all duration-300 shadow-sm group active:scale-95"
                        >
                            <img 
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                alt="Google logo" 
                                className="w-6 h-6 group-hover:scale-110 transition-transform"
                            />
                            Sign in with Google
                        </button>

                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Secure SSO</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium">
                            By continuing, you agree to the University Data Privacy Policy and Terms of Use.
                        </p>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    University Operations Hub • Auth Module E
                </div>
            </div>
        </div>
    );
};

export default Login;
