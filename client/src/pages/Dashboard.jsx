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
    <motion.button
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex flex-col items-center justify-center gap-3 p-6 glass rounded-[2rem] transition-all hover:shadow-xl group border border-transparent hover:border-primary/20"
    >
        <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
            <Icon className="h-7 w-7" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{label}</span>
    </motion.button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl dark:bg-slate-900"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">New Application</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Company</label>
                            <input type="text" required className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Role</label>
                            <input type="text" required className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Follow-up Date</label>
                        <input type="date" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-primary/20 dark:text-white" value={formData.followUpDate} onChange={e => setFormData({ ...formData, followUpDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Notes</label>
                        <textarea className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-3 outline-none focus:ring-2 focus:ring-primary/20 h-24 dark:text-white" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 py-4 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 rounded-2xl bg-primary py-4 font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20">Save Application</button>
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

            // Get recent 5
            const sortedApps = [...allApps].sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)).slice(0, 5);
            setRecentApps(sortedApps);

            // Get follow-ups
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-slate-400 uppercase text-xs tracking-widest">Loading Dashboard...</p>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 animate-fade-in pb-20"
        >
            <AddAppModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={fetchDashboardData} />

            <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <motion.div variants={itemVariants} className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-blue-600 p-1 shadow-2xl overflow-hidden shrink-0">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-full w-full rounded-2xl object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-900 text-2xl font-black text-white">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                                <Navigation className="h-3 w-3" /> Dashboard Active
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                            Hey, {user?.name?.split(' ')[0] || 'User'} 👋
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Tracking {stats?.total || 0} opportunities in {user?.profile?.state || 'India'}.</p>
                    </div>
                </motion.div>
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-primary px-8 py-5 font-black text-white shadow-2xl shadow-blue-500/20 hover:bg-blue-600 transition-all"
                >
                    <Plus className="h-6 w-6" /> New Application
                </motion.button>
            </header>

            <motion.section
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <QuickAction icon={Search} label="Find Jobs" onClick={() => navigate('/jobs')} color="bg-blue-500 text-white" />
                <QuickAction icon={Sparkles} label="AI Bot" onClick={() => navigate('/bot')} color="bg-emerald-500 text-white" />
                <QuickAction icon={User} label="Profile" onClick={() => navigate('/profile')} color="bg-purple-500 text-white" />
                <QuickAction icon={Calendar} label="Tracker" onClick={() => navigate('/tracker')} color="bg-amber-500 text-white" />
            </motion.section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {[
                    { label: 'Total Applications', value: stats.total, icon: BarChart3, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                    { label: 'Active Interviews', value: stats.statusCounts['Interview'] || 0, icon: Clock, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
                    { label: 'Offers Received', value: stats.statusCounts['Offer'] || 0, icon: CheckCircle2, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
                    { label: 'Rejections', value: stats.statusCounts['Rejected'] || 0, icon: XCircle, color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="glass rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all dark:bg-slate-900/50 group border border-transparent hover:border-primary/10"
                    >
                        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{item.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{item.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                <motion.div variants={itemVariants} className="glass rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            Upcoming Follow-ups
                        </h3>
                    </div>
                    <div className="flex-1 flex flex-col">
                        {followUpApps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {followUpApps.map((app, i) => (
                                    <div key={app.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-black text-primary border border-slate-100 dark:border-slate-700">
                                                {app.company.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white leading-none mb-1 line-clamp-1">{app.company}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter line-clamp-1">{app.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Due</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(app.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <CheckCircle2 className="h-10 w-10 text-slate-300 mb-3" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No follow-ups due!</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {stats.total > 0 ? (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        className="glass rounded-[2.5rem] p-8 shadow-sm dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                    >
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            Application Funnel
                        </h3>
                        <div className="h-72 flex justify-center">
                            <Pie
                                data={pieData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                usePointStyle: true,
                                                padding: 20,
                                                font: { weight: 'bold', size: 11 }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="glass rounded-[2.5rem] p-8 shadow-sm dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Activity</h3>
                            <button onClick={() => navigate('/tracker')} className="text-xs font-black uppercase text-primary hover:underline tracking-widest">History</button>
                        </div>
                        <div className="space-y-4">
                            {recentApps.map((app, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                                            {app.company.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white leading-none mb-1">{app.role}</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{app.company} • {new Date(app.appliedDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${app.status === 'Offer' ? 'bg-emerald-500 text-white' :
                                            app.status === 'Interview' ? 'bg-amber-500 text-white' :
                                                app.status === 'Rejected' ? 'bg-rose-500 text-white' :
                                                    'bg-blue-500 text-white'
                                            }`}>
                                            {app.status}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    variants={itemVariants}
                    className="glass rounded-[3rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                >
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Start your journey!</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-10 font-medium text-lg leading-relaxed">
                        Your dashboard looks a bit empty. Let's change that! Find your dream internship or chat with our AI career bot to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/jobs')}
                            className="w-full sm:w-auto rounded-2xl bg-primary px-10 py-5 font-black text-white shadow-2xl shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                        >
                            <Search className="h-5 w-5" /> Explore Jobs
                        </button>
                        <button
                            onClick={() => navigate('/bot')}
                            className="w-full sm:w-auto rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 px-10 py-5 font-black text-slate-900 dark:text-white shadow-sm hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                            <Sparkles className="h-5 w-5 text-emerald-500" /> Chat with AI
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Dashboard;
