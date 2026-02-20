import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    BarChart3,
    Calendar,
    Smartphone,
    ChevronRight,
    Navigation,
    Search,
    FileText,
    User,
    Sparkles
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2.5 p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl transition-colors hover:border-primary/30 hover:bg-primary/5 group"
    >
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-stone-600 dark:text-stone-400 group-hover:text-primary transition-colors">{label}</span>
    </button>
);

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AddAppModal = ({ isOpen, onClose, onAdd }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ company: '', role: '', status: 'Applied', notes: '', followUpDate: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'applications'), {
                ...formData,
                userId: user.uid,
                appliedDate: new Date().toISOString()
            });
            onAdd();
            onClose();
        } catch (err) {
            alert('Failed to add application');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-lg"
            >
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-5">New Application</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">Company</label>
                            <input type="text" required className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-primary focus:border-primary" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">Role</label>
                            <input type="text" required className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-primary focus:border-primary" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">Follow-up Date</label>
                        <input type="date" className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-primary focus:border-primary" value={formData.followUpDate} onChange={e => setFormData({ ...formData, followUpDate: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">Notes</label>
                        <textarea className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-2.5 text-sm text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-primary focus:border-primary h-20 resize-none" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-stone-200 dark:border-stone-700 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">Save Application</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, statusCounts: {} });
    const [recentApps, setRecentApps] = useState([]);
    const [followUpApps, setFollowUpApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        if (user) fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const allApps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const counts = {};
            allApps.forEach(app => {
                counts[app.status] = (counts[app.status] || 0) + 1;
            });

            setStats({ total: allApps.length, statusCounts: counts });

            const sortedApps = [...allApps].sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)).slice(0, 5);
            setRecentApps(sortedApps);

            const followUps = allApps
                .filter(app => app.followUpDate && new Date(app.followUpDate) >= new Date())
                .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
                .slice(0, 3);
            setFollowUpApps(followUps);

        } catch (err) {
            console.error('Error fetching dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const pieData = {
        labels: ['Applied', 'Interview', 'Offer', 'Rejected'],
        datasets: [{
            data: [
                stats.statusCounts['Applied'] || 0,
                stats.statusCounts['Interview'] || 0,
                stats.statusCounts['Offer'] || 0,
                stats.statusCounts['Rejected'] || 0
            ],
            backgroundColor: ['#60a5fa', '#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 0,
        }]
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-stone-500">Loading dashboard…</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            <AddAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={fetchDashboardData} />

            {/* Skill Reminder */}
            <AnimatePresence>
                {user && (!user.skills || user.skills.length === 0) && !isDismissed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">Complete your profile</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">Adding skills helps our AI match you with better internships.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => setIsDismissed(true)} className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 px-3 py-1.5 rounded-lg transition-colors">
                                    Later
                                </button>
                                <button onClick={() => navigate('/profile')} className="text-sm font-medium bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
                                    Add Skills
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/30 ring-offset-2 ring-offset-[#f8f7f4] dark:ring-offset-[#1a1a2e]">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary text-lg font-semibold text-white">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                            Hey, {user?.name?.split(' ')[0] || 'User'} 👋
                        </h1>
                        <p className="text-sm text-stone-500 dark:text-stone-400">Tracking {stats?.total || 0} opportunities in {user?.profile?.state || 'India'}.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                >
                    <Plus className="h-4 w-4" /> New Application
                </button>
            </header>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction icon={Search} label="Find Jobs" onClick={() => navigate('/jobs')} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                <QuickAction icon={Sparkles} label="AI Bot" onClick={() => navigate('/bot')} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                <QuickAction icon={User} label="Profile" onClick={() => navigate('/profile')} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
                <QuickAction icon={Calendar} label="Tracker" onClick={() => navigate('/tracker')} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
            </section>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {
                    [
                        { label: 'Total Applications', value: stats.total, icon: BarChart3, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', border: 'border-l-blue-400' },
                        { label: 'Active Interviews', value: stats.statusCounts['Interview'] || 0, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', border: 'border-l-amber-400' },
                        { label: 'Offers Received', value: stats.statusCounts['Offer'] || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-400' },
                        { label: 'Rejections', value: stats.statusCounts['Rejected'] || 0, icon: XCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20', border: 'border-l-rose-400' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 border-l-4 ${item.border} rounded-xl p-5`}
                        >
                            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}>
                                <item.icon className="h-4 w-4" />
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">{item.label}</p>
                            <p className="text-2xl font-semibold text-stone-900 dark:text-stone-100">{item.value}</p>
                        </div>
                    ))}
            </div>

            {/* Follow-ups */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-5">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    Upcoming Follow-ups
                </h3>
                {followUpApps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {followUpApps.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-sm font-medium text-primary">
                                        {app.company.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 line-clamp-1">{app.company}</p>
                                        <p className="text-xs text-stone-500 line-clamp-1">{app.role}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="text-xs text-amber-600 font-medium">Due</p>
                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{new Date(app.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-stone-50 dark:bg-stone-800/30 rounded-lg border border-dashed border-stone-200 dark:border-stone-700">
                        <CheckCircle2 className="h-8 w-8 text-stone-300 dark:text-stone-600 mb-2" />
                        <p className="text-sm text-stone-400">No follow-ups due</p>
                    </div>
                )}
            </div>

            {stats.total > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Chart */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-6">
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                            Application Funnel
                        </h3>
                        <div className="h-64 flex justify-center">
                            <Pie
                                data={pieData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                usePointStyle: true,
                                                padding: 16,
                                                font: { weight: '500', size: 12 }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Recent Activity</h3>
                            <button onClick={() => navigate('/tracker')} className="text-xs font-medium text-primary hover:underline">View all</button>
                        </div>
                        <div className="space-y-1">
                            {recentApps.map((app, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm text-stone-500 font-medium">
                                            {app.company.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{app.role}</p>
                                            <p className="text-xs text-stone-500">{app.company} · {new Date(app.appliedDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${app.status === 'Offer' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        app.status === 'Interview' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-10 text-center border-dashed">
                    <Sparkles className="h-8 w-8 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Start your journey</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
                        Your dashboard looks a bit empty. Find your dream internship or chat with our AI career bot to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                        >
                            <Search className="h-4 w-4" /> Explore Jobs
                        </button>
                        <button
                            onClick={() => navigate('/bot')}
                            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-5 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                        >
                            <Sparkles className="h-4 w-4 text-emerald-500" /> Chat with AI
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
