import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    LayoutDashboard,
    Search,
    FileText,
    User,
    LogOut,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/jobs', label: 'Jobs', icon: Search },
        { path: '/tracker', label: 'Tracker', icon: FileText },
        { path: '/analyzer', label: 'Analyzer', icon: Sparkles },
        { path: '/bot', label: 'AI Bot', icon: Sparkles },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full px-4 py-4">
            <div className="mx-auto max-w-[85rem]">
                <div className="glass flex items-center justify-between rounded-[2rem] border border-slate-200 px-8 py-3 shadow-2xl backdrop-blur-3xl bg-white/95 dark:bg-slate-900/80 dark:border-slate-800/50 transition-all duration-300">
                    <Link to="/" className="flex items-center gap-3 text-2xl font-black tracking-tight transition-transform active:scale-95 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform overflow-hidden">
                            <img src="/logo.png" alt="Intern-AI Logo" className="h-full w-full object-cover" />
                        </div>
                        <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                            Intern-AI
                        </span>
                    </Link>

                    <div className="hidden items-center gap-2 md:flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-white/10 dark:border-slate-700/50">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${isActive(link.path)
                                    ? 'text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                            >
                                <link.icon className={`h-4 w-4 z-10 ${isActive(link.path) ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`} />
                                <span className="z-10">{link.label}</span>
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-blue-500/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
                                <Link to="/profile" className="flex items-center gap-3 rounded-2xl bg-white/50 p-1.5 pr-5 transition-all hover:bg-white active:scale-95 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-white/40 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900 group">
                                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-blue-600 text-[10px] font-black text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div className="hidden flex-col items-start xl:flex">
                                        <span className="text-sm font-black text-slate-800 dark:text-white leading-none mb-0.5">
                                            {user.name?.split(' ')[0] || 'User'}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-primary transition-colors">
                                            {user.role || 'Student'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3 w-3 text-slate-400 ml-1 group-hover:translate-y-0.5 transition-transform" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 ml-1">
                                <Link to="/login" className="text-sm font-bol text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors px-2">Login</Link>
                                <Link to="/register" className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95 dark:bg-primary dark:hover:bg-blue-600 dark:shadow-blue-500/20">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
