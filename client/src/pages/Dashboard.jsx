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

const QuickAction = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-2.5 p-5 bg-chassis rounded-xl shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#a8b4c4,-8px_-8px_16px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200 group"
    >
        <div className="h-12 w-12 rounded-full bg-chassis shadow-[3px_3px_6px_#a8b4c4,-3px_-3px_6px_#ffffff,inset_1px_1px_0_#ffffff] flex items-center justify-center group-hover:shadow-[0_0_10px_2px_rgba(230,57,70,0.6)] transition-all duration-300">
            <Icon className="h-5 w-5 text-text-muted group-hover:text-accent-primary transition-colors duration-300" />
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted group-hover:text-text-primary transition-colors">{label}</span>
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
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-lg bg-chassis rounded-2xl p-6 shadow-[12px_12px_24px_#a8b4c4,-12px_-12px_24px_#ffffff]"
            >
                <h2 className="text-xl font-bold text-text-primary mb-5 drop-shadow-[0_1px_1px_#ffffff]">New Application</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Company</label>
                            <input type="text" required className="w-full bg-recessed rounded-lg p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Role</label>
                            <input type="text" required className="w-full bg-recessed rounded-lg p-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Follow-up Date</label>
                        <input type="date" className="w-full bg-recessed rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono" value={formData.followUpDate} onChange={e => setFormData({ ...formData, followUpDate: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Notes</label>
                        <textarea className="w-full bg-recessed rounded-lg p-2.5 text-sm text-text-primary focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono h-20 resize-none" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-chassis text-text-primary py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200">Cancel</button>
                        <button type="submit" className="flex-1 bg-accent-primary text-white py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200">Save Application</button>
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
            backgroundColor: ['#e63946', '#1a202c', '#059669', '#5a6577'],
            borderWidth: 0,
        }]
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <div className="h-8 w-8 border-2 border-safety-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono text-text-muted">Loading dashboard…</p>
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-chassis rounded-xl p-5 shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff]">
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-accent-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-text-primary">Complete your profile</p>
                                    <p className="text-sm text-text-muted mt-0.5">Adding skills helps our AI match you with better internships.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => setIsDismissed(true)} className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg transition-colors">
                                    Later
                                </button>
                                <button onClick={() => navigate('/profile')} className="text-xs font-bold uppercase tracking-wider bg-accent-primary text-white px-4 py-1.5 rounded-lg shadow-[3px_3px_6px_#a8b4c4,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] active:shadow-[inset_3px_3px_6px_#a8b4c4,inset_-3px_-3px_6px_#ffffff] active:translate-y-0.5 transition-all duration-200">
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
                    <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff,inset_1px_1px_0_#ffffff]">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-chassis text-lg font-bold text-text-primary font-mono">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary drop-shadow-[0_1px_1px_#ffffff]">
                            Hey, {user?.name?.split(' ')[0] || 'User'}
                        </h1>
                        <p className="text-sm font-mono text-text-muted">Tracking {stats?.total || 0} opportunities in {user?.profile?.state || 'India'}.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-accent-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="h-4 w-4" /> New Application
                </button>
            </header>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction icon={Search} label="Find Jobs" onClick={() => navigate('/jobs')} />
                <QuickAction icon={Sparkles} label="AI Bot" onClick={() => navigate('/bot')} />
                <QuickAction icon={User} label="Profile" onClick={() => navigate('/profile')} />
                <QuickAction icon={Calendar} label="Tracker" onClick={() => navigate('/tracker')} />
            </section>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {
                    [
                        { label: 'Total Applications', value: stats.total, icon: BarChart3 },
                        { label: 'Active Interviews', value: stats.statusCounts['Interview'] || 0, icon: Clock },
                        { label: 'Offers Received', value: stats.statusCounts['Offer'] || 0, icon: CheckCircle2 },
                        { label: 'Rejections', value: stats.statusCounts['Rejected'] || 0, icon: XCircle },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-chassis rounded-xl p-5 shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff]"
                        >
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-chassis shadow-[3px_3px_6px_#a8b4c4,-3px_-3px_6px_#ffffff,inset_1px_1px_0_#ffffff]">
                                <item.icon className="h-5 w-5 text-accent-primary" />
                            </div>
                            <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-2xl font-bold font-mono text-text-primary drop-shadow-[0_1px_1px_#ffffff]">{item.value}</p>
                        </div>
                    ))}
            </div>

            {/* Follow-ups */}
            <div className="bg-chassis rounded-xl p-6 shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff]">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2 mb-5 drop-shadow-[0_1px_1px_#ffffff]">
                    <Calendar className="h-4 w-4 text-accent-primary" />
                    Upcoming Follow-ups
                </h3>
                {followUpApps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {followUpApps.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 rounded-lg bg-chassis shadow-[inset_3px_3px_6px_#a8b4c4,inset_-3px_-3px_6px_#ffffff]">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-chassis shadow-[3px_3px_6px_#a8b4c4,-3px_-3px_6px_#ffffff,inset_1px_1px_0_#ffffff] flex items-center justify-center text-sm font-bold font-mono text-accent-primary">
                                        {app.company.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary line-clamp-1">{app.company}</p>
                                        <p className="text-xs font-mono text-text-muted line-clamp-1">{app.role}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <p className="text-xs font-mono font-bold text-accent-primary uppercase tracking-wider">Due</p>
                                    <p className="text-sm font-bold font-mono text-text-primary">{new Date(app.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-chassis rounded-lg shadow-[inset_3px_3px_6px_#a8b4c4,inset_-3px_-3px_6px_#ffffff]">
                        <CheckCircle2 className="h-8 w-8 text-text-muted mb-2" />
                        <p className="text-sm font-mono text-text-muted">No follow-ups due</p>
                    </div>
                )}
            </div>

            {stats.total > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Chart */}
                    <div className="bg-chassis rounded-xl p-6 shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff]">
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2 mb-6 drop-shadow-[0_1px_1px_#ffffff]">
                            <BarChart3 className="h-4 w-4 text-accent-primary" />
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
                                                font: { family: "'JetBrains Mono', monospace", weight: '600', size: 11 }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-chassis rounded-xl p-6 shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-text-primary drop-shadow-[0_1px_1px_#ffffff]">Recent Activity</h3>
                            <button onClick={() => navigate('/tracker')} className="text-xs font-mono font-bold text-accent-primary hover:underline uppercase tracking-wider">View all</button>
                        </div>
                        <div className="space-y-1">
                            {recentApps.map((app, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg hover:shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-chassis shadow-[3px_3px_6px_#a8b4c4,-3px_-3px_6px_#ffffff,inset_1px_1px_0_#ffffff] flex items-center justify-center text-sm font-bold font-mono text-text-muted">
                                            {app.company.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{app.role}</p>
                                            <p className="text-xs font-mono text-text-muted">{app.company} · {new Date(app.appliedDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`rounded-md px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider ${
                                        app.status === 'Offer' ? 'bg-emerald-600 text-white shadow-md' :
                                        app.status === 'Interview' ? 'bg-amber-500 text-white shadow-md' :
                                        app.status === 'Rejected' ? 'bg-red-600 text-white shadow-md' :
                                        'bg-chassis text-text-primary shadow-[inset_2px_2px_4px_#a8b4c4,inset_-2px_-2px_4px_#ffffff]'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-chassis rounded-xl p-10 text-center shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff]">
                    <Sparkles className="h-8 w-8 text-text-muted mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-primary mb-2 drop-shadow-[0_1px_1px_#ffffff]">Start your journey</h2>
                    <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
                        Your dashboard looks a bit empty. Find your dream internship or chat with our AI career bot to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="inline-flex items-center gap-2 bg-accent-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200"
                        >
                            <Search className="h-4 w-4" /> Explore Jobs
                        </button>
                        <button
                            onClick={() => navigate('/bot')}
                            className="inline-flex items-center gap-2 bg-chassis px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200"
                        >
                            <Sparkles className="h-4 w-4 text-accent-primary" /> Chat with AI
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
