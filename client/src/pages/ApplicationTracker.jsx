import React, { useState, useEffect } from 'react';
import {
    FileText,
    Trash2,
    Edit3,
    Search,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ApplicationTracker = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (user) fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        try {
            const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const appsData = querySnapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            setApps(appsData);
        } catch (err) {
            console.error('Error fetching applications', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteApp = async (id) => {
        if (window.confirm('Are you sure you want to remove this application?')) {
            try {
                await deleteDoc(doc(db, 'applications', id));
                setApps(apps.filter(app => app._id !== id));
            } catch (err) {
                alert('Failed to delete');
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Offer': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'Interview': return <Clock className="h-4 w-4 text-amber-500" />;
            case 'Rejected': return <XCircle className="h-4 w-4 text-rose-500" />;
            default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
        }
    };

    const filteredApps = apps.filter(app =>
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Application Tracker</h1>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Keep track of every step in your career journey.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Search applications…"
                        className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary sm:w-72"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-stone-100 dark:border-stone-800">
                                <th className="px-5 py-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Company & Role</th>
                                <th className="px-5 py-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Applied</th>
                                <th className="px-5 py-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Follow Up</th>
                                <th className="px-5 py-3 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            <AnimatePresence>
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-5 py-4"><div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded" /></td>
                                            <td className="px-5 py-4"><div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded" /></td>
                                            <td className="px-5 py-4"><div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded" /></td>
                                            <td className="px-5 py-4"><div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded" /></td>
                                            <td className="px-5 py-4"><div className="h-4 w-12 bg-stone-200 dark:bg-stone-800 rounded ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredApps.length > 0 ? filteredApps.map((app) => (
                                    <motion.tr
                                        key={app._id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-sm text-stone-500 font-medium">
                                                    {app.company.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{app.role}</p>
                                                    <p className="text-xs text-stone-500">{app.company}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(app.status)}
                                                <span className="text-sm text-stone-700 dark:text-stone-300">{app.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-stone-600 dark:text-stone-400">{new Date(app.appliedDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-primary">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {app.followUpDate ? new Date(app.followUpDate).toLocaleDateString() : 'Set Date'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right space-x-1">
                                            <button className="p-1.5 text-stone-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteApp(app._id)}
                                                className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-16 text-center text-sm text-stone-400 dark:text-stone-500">
                                            No applications tracked yet. Start applying!
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApplicationTracker;
