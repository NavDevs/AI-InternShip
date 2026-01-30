import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Search,
    MapPin,
    Briefcase,
    Calendar,
    Filter,
    ExternalLink,
    Zap,
    Navigation,
    Loader2,
    Info,
    CheckCircle2,
    Clock,
    IndianRupee,
    Tag,
    ChevronDown
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { INDIAN_STATES } from '../constants/states';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const SkeletonCard = () => (
    <div className="glass h-80 animate-pulse rounded-[2.5rem] p-8 space-y-4">
        <div className="flex justify-between">
            <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-3/4 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2 pt-4">
            <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-900" />
            <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-900" />
        </div>
    </div>
);

const JOB_ROLES = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Analyst", "Data Scientist", "Machine Learning Engineer", "UI/UX Designer",
    "Product Manager", "Digital Marketer", "Content Writer", "Mobile App Developer"
];

const JobListings = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [savingState, setSavingState] = useState(false);
    const navigate = useNavigate();

    // Sync initial location
    useEffect(() => {
        if (user?.profile?.state && !location) {
            setLocation(user.profile.state);
        }
    }, [user?.profile?.state]);

    // Debounced search logic
    useEffect(() => {
        setLoading(true); // Show skeleton immediately
        const timer = setTimeout(() => {
            fetchJobs();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, role, location, type]);

    const handleUpdateState = async (newState) => {
        if (!user) return;
        setSavingState(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                'profile.state': newState
            });
            setLocation(newState); // Update local state immediately for instant feedback
        } catch (err) {
            console.error('Update state failed:', err);
        } finally {
            setSavingState(false);
        }
    };

    useEffect(() => {
        // Location detection removed as per rules. 
        // We now rely on manually selected state from user profile.
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            // Live Search is now the default
            setIsLive(true);

            // Use user's state if no manual location is entered
            const searchLocation = location.trim() || user?.profile?.state || 'India';
            const searchKeyword = `${role} ${search}`.trim() || 'internship';

            const res = await axios.get(`${API_BASE_URL}/jobs/live`, {
                params: {
                    keyword: searchKeyword,
                    location: searchLocation
                }
            });
            setJobs(res.data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch live opportunities. Using local listings.');
            // Fallback to local
            const res = await axios.get(`${API_BASE_URL}/jobs`, {
                params: {
                    type: type || undefined,
                    state: user?.profile?.state || undefined
                }
            });
            setJobs(res.data);
        } finally {
            setLoading(false);
        }
    };

    // Filter jobs by user state for live results too
    const filteredJobs = jobs.filter(job => {
        // If user is searching a specific location, prioritize that for visibility
        const currentFilterState = location || user?.profile?.state;
        if (!currentFilterState) return true;

        const filterState = currentFilterState.toLowerCase();
        const jobLoc = job.location?.toLowerCase() || '';
        const jobTitle = job.title?.toLowerCase() || '';

        // Return true if location contains state OR if it's remote
        return jobLoc.includes(filterState) || jobLoc.includes('remote');
    });

    const handleApply = async (job) => {
        if (!user) return;

        // Open link immediately
        window.open(job.link, '_blank');

        // Automatically save to tracker
        try {
            const appliedDate = new Date();
            const followUpDate = new Date();
            followUpDate.setDate(appliedDate.getDate() + 5);

            await addDoc(collection(db, 'applications'), {
                company: job.company,
                role: job.title,
                status: 'Applied',
                appliedDate: appliedDate.toISOString(),
                followUpDate: followUpDate.toISOString(),
                location: job.location,
                userId: user.uid,
                source: job.source || 'Intern-AI'
            });
            setAppliedJobs(prev => new Set(prev).add(job._id || job.id));
        } catch (err) {
            console.error('Save to tracker failed:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-fade-in pb-20"
        >
            <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                            <Navigation className="h-3 w-3" /> Your State: {user?.profile?.state || 'Selection Required'}
                        </span>
                        {isLive && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                                <Zap className="h-3 w-3 fill-amber-400" /> Real-time mode
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">Live Opportunities</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Explore the latest internships and jobs fetched directly from the internet.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Skill or Company"
                            className="w-full rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 py-3 pl-10 pr-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select
                            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-4 pr-10 text-sm font-bold text-slate-900 dark:text-white shadow-sm transition-all focus:ring-2 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <select
                            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-10 pr-10 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white appearance-none cursor-pointer"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            <option value="">All Regions</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <select
                            className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-10 pr-10 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white appearance-none cursor-pointer"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">Internship</option>
                            <option value="job">Full-time</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </header>

            {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                    <Info className="h-5 w-5" /> {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : !user?.profile?.state ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 px-8 glass rounded-[3rem] text-center border-2 border-primary/20 bg-primary/5"
                >
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                        <MapPin className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Where do you live?</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 font-medium">
                        To show you the most relevant local internships, please select your state. We'll match jobs in your area automatically.
                    </p>

                    <div className="w-full max-w-sm relative">
                        <select
                            onChange={(e) => handleUpdateState(e.target.value)}
                            disabled={savingState}
                            className="w-full rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 text-sm font-bold shadow-xl focus:ring-primary focus:border-primary disabled:opacity-50 transition-all appearance-none pr-12"
                        >
                            <option value="">Select your State</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        {savingState && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-primary font-bold text-xs">
                                <Loader2 className="h-3 w-3 animate-spin" /> Saving your preference...
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
                            <motion.div
                                key={job._id || job.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => navigate(`/job/${job._id || job.id}`, { state: { job } })}
                                className="glass group relative flex flex-col justify-between rounded-[2rem] p-0 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border-slate-100 dark:border-slate-800 cursor-pointer"
                            >
                                <div className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm bg-orange-500 text-white`}>
                                            Paid
                                        </span>
                                        <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="h-10 w-10 object-contain" />
                                            ) : (
                                                <span className="font-black text-primary text-xl">{job.company?.[0]}</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-0 leading-tight line-clamp-2" dangerouslySetInnerHTML={{ __html: job.title }} />
                                    <p className="text-xs font-medium text-slate-500 mb-6 font-bold">at {job.company}</p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="opacity-70">Internship Location:</span> {job.location}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                                            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="opacity-70">Work mode:</span> {job.workMode || 'On-site'}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="opacity-70">Duration:</span> {job.duration || '4 Months'}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                                            <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                                            <span className="opacity-70">Fees:</span> {job.fees || 'Free'}
                                        </div>
                                    </div>

                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 font-medium">
                                        {job.description?.replace(/<[^>]*>?/gm, '')}
                                    </p>

                                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-100/50 dark:border-amber-900/30 flex items-center gap-3 mb-4">
                                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-amber-200">
                                            <Tag className="h-3 w-3 text-amber-600" />
                                        </div>
                                        <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                            Job offer upto ₹ 3.0 LPA to 34 LPA (per annum) post Internship
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto border-t border-slate-50 dark:border-slate-800/50 py-4 px-8 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/10">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Apply By</span>
                                        <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">
                                            {job.applyBy || '2026-05-31'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleApply(job)}
                                        className="rounded-lg border-2 border-primary px-5 py-2 text-[11px] font-black text-primary hover:bg-primary hover:text-white transition-all transform active:scale-95"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-32 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-xl font-bold text-slate-400">No jobs in your state ({user?.profile?.state || 'Selection Required'}).</p>
                                <button onClick={() => { setSearch(''); setLocation(''); }} className="mt-4 text-primary font-black uppercase text-sm hover:underline">Clear Search</button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default JobListings;
