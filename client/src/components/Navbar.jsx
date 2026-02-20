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
            <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                                <img src="/logo.png" alt="Intern-AI Logo" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                                Intern-AI
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(link.path)
                                        ? 'bg-[#e8eff8] dark:bg-blue-950/50 text-primary dark:text-blue-300 font-semibold'
                                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800'
                                        }`}
                                >
                                    <link.icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-white">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="hidden xl:flex flex-col items-start">
                                            <span className="text-sm font-medium text-stone-800 dark:text-stone-200 leading-tight">
                                                {user.name?.split(' ')[0] || 'User'}
                                            </span>
                                            <span className="text-xs text-stone-500 dark:text-stone-500">
                                                {user.role || 'Student'}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-2">
                                    <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 px-3 py-2 rounded-lg transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-stone-600 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
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
                            transition={{ duration: 0.15 }}
                            onClick={closeMenu}
                            className="fixed inset-0 z-[60] bg-black/40 md:hidden"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 z-[70] h-full w-72 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 md:hidden overflow-y-auto"
                        >
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
                                <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                                        <img src="/logo.png" alt="Intern-AI Logo" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                                        Intern-AI
                                    </span>
                                </Link>
                                <button
                                    onClick={closeMenu}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* User Profile (if logged in) */}
                            {user && (
                                <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800">
                                    <Link
                                        to="/profile"
                                        onClick={closeMenu}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-medium text-white">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                                                {user.name || 'User'}
                                            </span>
                                            <span className="text-xs text-stone-500">
                                                {user.role || 'Student'}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Navigation Links */}
                            <nav className="px-3 py-4">
                                <div className="space-y-0.5">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={closeMenu}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${isActive(link.path)
                                                ? 'border-primary bg-[#e8eff8] dark:bg-blue-950/50 text-primary font-semibold'
                                                : 'border-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                                                }`}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </nav>

                            {/* Bottom Actions */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            to="/login"
                                            onClick={closeMenu}
                                            className="flex w-full items-center justify-center px-4 py-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={closeMenu}
                                            className="flex w-full items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
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
