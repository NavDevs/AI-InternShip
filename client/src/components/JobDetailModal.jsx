import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import {
    X,
    MapPin,
    Briefcase,
    Clock,
    IndianRupee,
    CheckCircle2,
    XCircle,
    Loader2,
    Sparkles,
    ExternalLink,
    AlertTriangle,
    BookOpen,
    Target,
    ChevronRight
} from 'lucide-react';

const JobDetailModal = ({ job, isOpen, onClose }) => {
    const { user } = useAuth();
    const [eligibility, setEligibility] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && job) {
            checkEligibility();
        }
        return () => {
            setEligibility(null);
            setError(null);
        };
    }, [isOpen, job]);

    const checkEligibility = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await user.getIdToken();
            const res = await axios.post(
                `${API_BASE_URL}/ai/eligibility`,
                {
                    job: {
                        title: job.title?.replace(/<[^>]*>?/gm, ''),
                        company: job.company,
                        description: job.description?.replace(/<[^>]*>?/gm, ''),
                        location: job.location
                    },
                    userSkills: user?.skills || []
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEligibility(res.data);
        } catch (err) {
            console.error('Eligibility check failed:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
            setError(`Failed to analyze: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        window.open(job.link, '_blank');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-stone-900 shadow-lg border border-stone-200 dark:border-stone-800"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="overflow-y-auto max-h-[90vh] p-6">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-semibold shrink-0">
                                    {job.company?.[0] || 'J'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 leading-snug" dangerouslySetInnerHTML={{ __html: job.title }} />
                                    <p className="text-sm text-stone-500 mt-0.5">{job.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                                    <MapPin className="h-3 w-3" /> {job.location}
                                </span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                                    <Briefcase className="h-3 w-3" /> {job.workMode || 'On-site'}
                                </span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                                    <Clock className="h-3 w-3" /> {job.duration || '4 Months'}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6 p-4 rounded-lg bg-stone-50 dark:bg-stone-800">
                            <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">About This Role</h3>
                            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                {job.description?.replace(/<[^>]*>?/gm, '') || 'No description available for this position.'}
                            </p>
                        </div>

                        {/* AI Eligibility */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI Eligibility Analysis</h3>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-10 rounded-lg bg-stone-50 dark:bg-stone-800">
                                    <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
                                    <p className="text-xs text-stone-500">Analyzing your skills…</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4" />
                                    <p className="text-xs flex-1">{error}</p>
                                    <button onClick={checkEligibility} className="text-xs font-medium underline">Retry</button>
                                </div>
                            ) : eligibility ? (
                                <div className="space-y-4">
                                    {/* Score */}
                                    <div className={`p-4 rounded-lg ${eligibility.isEligible ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                {eligibility.isEligible ? (
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                ) : (
                                                    <Target className="h-6 w-6 text-amber-500" />
                                                )}
                                                <div>
                                                    <h4 className={`text-sm font-semibold ${eligibility.isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                                        {eligibility.isEligible ? "You're Qualified!" : "Almost There!"}
                                                    </h4>
                                                    <p className="text-xs text-stone-500">{eligibility.summary}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-2xl font-semibold ${eligibility.isEligible ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {eligibility.eligibilityScore}%
                                                </span>
                                                <p className="text-xs text-stone-400">Match</p>
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <h5 className="text-xs text-stone-500 mb-1.5">Matched</h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {eligibility.matchedSkills?.length > 0 ? eligibility.matchedSkills.map((skill, i) => (
                                                        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px]">
                                                            <CheckCircle2 className="h-2.5 w-2.5" /> {skill}
                                                        </span>
                                                    )) : <span className="text-xs text-stone-400">None</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="text-xs text-stone-500 mb-1.5">Missing</h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {eligibility.missingSkills?.length > 0 ? eligibility.missingSkills.map((skill, i) => (
                                                        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[11px]">
                                                            <XCircle className="h-2.5 w-2.5" /> {skill}
                                                        </span>
                                                    )) : <span className="text-xs text-stone-400">None — great match!</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Roadmap (if not eligible) */}
                                    {!eligibility.isEligible && eligibility.roadmap && (
                                        <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700">
                                            <div className="flex items-center gap-2 mb-3">
                                                <BookOpen className="h-4 w-4 text-indigo-500" />
                                                <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">{eligibility.roadmap.title}</h4>
                                                <span className="ml-auto text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                                                    {eligibility.roadmap.duration}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {eligibility.roadmap.steps?.map((step, i) => (
                                                    <div key={i} className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700">
                                                        <h5 className="text-xs font-medium text-stone-900 dark:text-stone-100 mb-1">{step.phase}</h5>
                                                        <p className="text-[11px] text-stone-500 mb-2">Learn: {step.skills?.join(', ')}</p>

                                                        {step.resources?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {step.resources.map((resource, j) => (
                                                                    <a
                                                                        key={j}
                                                                        href={resource.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[11px] hover:bg-indigo-100 transition-colors"
                                                                    >
                                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                                        {resource.name}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleApply}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Apply Now
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default JobDetailModal;
