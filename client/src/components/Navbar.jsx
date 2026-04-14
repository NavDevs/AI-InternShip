import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Briefcase,
    LayoutDashboard,
    Search,
    FileText,
    User,
    LogOut,
    Sparkles,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/jobs', label: 'Jobs', icon: Search },
        { path: '/tracker', label: 'Tracker', icon: FileText },
        { path: '/analyzer', label: 'Analyzer', icon: Sparkles },
        { path: '/bot', label: 'AI Bot', icon: Sparkles },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="sticky top-0 z-50 w-full glass-panel">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                <img src="/logo.png" alt="Intern-AI Logo" className="h-full w-full object-cover filter brightness-200 invert-[1]" />
                            </div>
                            <span className="text-xl font-bold font-outfit text-white tracking-wide">
                                Intern-AI
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${isActive(link.path)
                                        ? 'bg-white/10 text-brand-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <link.icon className={`h-4 w-4 ${isActive(link.path) ? 'text-brand-400' : 'text-text-muted'}`} />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/5 border border-transparent hover:border-white/10"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-brand-400">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="hidden xl:flex flex-col items-start">
                                            <span className="text-sm font-medium text-white leading-tight">
                                                {user.name?.split(' ')[0] || 'User'}
                                            </span>
                                            <span className="text-[10px] uppercase text-text-muted tracking-wider">
                                                {user.role || 'Student'}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white px-3 py-2 transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-200 border border-brand-500 hover:-translate-y-0.5">
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-all duration-200 hover:bg-white/10"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMenu}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="fixed top-0 left-0 z-[70] h-full w-72 glass-panel border-r border-white/10 md:hidden overflow-y-auto"
                        >
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                                <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                        <img src="/logo.png" alt="Intern-AI Logo" className="h-full w-full object-cover filter brightness-200 invert-[1]" />
                                    </div>
                                    <span className="text-xl font-bold font-outfit text-white tracking-wide">
                                        Intern-AI
                                    </span>
                                </Link>
                                <button
                                    onClick={closeMenu}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-white/10 hover:text-white transition-all duration-200"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* User Profile (if logged in) */}
                            {user && (
                                <div className="px-5 py-4 border-b border-white/5">
                                    <Link
                                        to="/profile"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-brand-400">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">
                                                {user.name || 'User'}
                                            </span>
                                            <span className="text-[10px] uppercase text-text-muted tracking-wider">
                                                {user.role || 'Student'}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Navigation Links */}
                            <nav className="px-3 py-4 flex-1">
                                <div className="space-y-1.5">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={closeMenu}
                                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${isActive(link.path)
                                                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                                                : 'text-text-secondary hover:text-white hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <link.icon className={`h-5 w-5 ${isActive(link.path) ? 'text-brand-400' : 'text-text-muted'}`} />
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </nav>

                            {/* Bottom Actions */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md">
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/30"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                ) : (
                                    <div className="space-y-2.5">
                                        <Link
                                            to="/login"
                                            onClick={closeMenu}
                                            className="flex w-full items-center justify-center px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold rounded-lg transition-all duration-200 border border-white/10"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={closeMenu}
                                            className="flex w-full items-center justify-center px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-200 border border-brand-500"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
