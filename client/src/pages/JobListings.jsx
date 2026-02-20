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
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 animate-pulse space-y-4">
        <div className="flex justify-between">
            <div className="h-10 w-10 rounded-lg bg-stone-200 dark:bg-stone-800" />
            <div className="h-5 w-16 rounded-full bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-4 w-1/2 rounded bg-stone-100 dark:bg-stone-900" />
        <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-stone-100 dark:bg-stone-900" />
            <div className="h-3 w-5/6 rounded bg-stone-100 dark:bg-stone-900" />
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

    useEffect(() => {
        if (user?.profile?.state && !location) {
            setLocation(user.profile.state);
        }
    }, [user?.profile?.state]);

    useEffect(() => {
        setLoading(true);
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
            setLocation(newState);
        } catch (err) {
            console.error('Update state failed:', err);
        } finally {
            setSavingState(false);
        }
    };

    useEffect(() => {
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            setIsLive(true);
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

    const filteredJobs = jobs.filter(job => {
        const currentFilterState = location || user?.profile?.state;
        if (!currentFilterState) return true;

        const filterState = currentFilterState.toLowerCase();
        const jobLoc = job.location?.toLowerCase() || '';

        return jobLoc.includes(filterState) || jobLoc.includes('remote');
    });

    const handleApply = async (job) => {
        if (!user) return;

        window.open(job.link, '_blank');

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
            className="space-y-6 animate-fade-in pb-16"
        >
            {/* Header */}
            <header className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <Navigation className="h-3 w-3" /> {user?.profile?.state || 'Select State'}
                            </span>
                            {isLive && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                    <Zap className="h-3 w-3" /> Live
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Live Opportunities</h1>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Explore the latest internships and jobs fetched from the internet.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Skill or company"
                            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-stone-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select
                            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-3 pr-8 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            {JOB_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <select
                            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-8 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        >
                            <option value="">All Regions</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                        <select
                            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-8 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="">Internship</option>
                            <option value="job">Full-time</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                    </div>
                </div>
            </header>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 text-sm text-amber-700 dark:text-amber-400">
                    <Info className="h-4 w-4 shrink-0" /> {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : !user?.profile?.state ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                    <MapPin className="h-8 w-8 text-stone-300 dark:text-stone-600 mb-4" />
                    <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Where do you live?</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mb-6">
                        Select your state so we can show you the most relevant local internships.
                    </p>
                    <div className="w-full max-w-xs relative">
                        <select
                            onChange={(e) => handleUpdateState(e.target.value)}
                            disabled={savingState}
                            className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 appearance-none pr-10"
                        >
                            <option value="">Select your state</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                        {savingState && (
                            <div className="flex items-center justify-center gap-2 mt-3 text-primary text-xs">
                                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
                            <motion.div
                                key={job._id || job.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => navigate(`/job/${job._id || job.id}`, { state: { job } })}
                                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                            Paid
                                        </span>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden shrink-0">
                                            {job.logo ? (
                                                <img src={job.logo} alt={job.company} className="h-8 w-8 object-contain" />
                                            ) : (
                                                <span className="font-medium text-primary text-sm">{job.company?.[0]}</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1 leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: job.title }} />
                                    <p className="text-xs text-stone-500 mb-4">at {job.company}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-xs text-stone-500">
                                            <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-stone-500">
                                            <Briefcase className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                            <span>{job.workMode || 'On-site'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-stone-500">
                                            <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                                            <span>{job.duration || '4 Months'}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-4">
                                        {job.description?.replace(/<[^>]*>?/gm, '')}
                                    </p>

                                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5 border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
                                        <Tag className="h-3 w-3 text-amber-600 shrink-0" />
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            Job offer upto ₹ 3.0 LPA to 34 LPA post Internship
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-stone-100 dark:border-stone-800 py-3 px-5 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                                    <div>
                                        <span className="text-xs text-stone-400">Apply By</span>
                                        <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                                            {job.applyBy || '2026-05-31'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                                        className="rounded-lg border border-primary px-4 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-colors"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-200 dark:border-stone-700">
                                <Search className="h-8 w-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                                <p className="text-sm text-stone-500">No jobs found in {user?.profile?.state || 'your area'}.</p>
                                <button onClick={() => { setSearch(''); setLocation(''); }} className="mt-3 text-sm text-primary font-medium hover:underline">Clear search</button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default JobListings;
