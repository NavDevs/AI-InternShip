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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="overflow-y-auto max-h-[90vh] p-8">
                        {/* Job Header */}
                        <div className="mb-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white text-2xl font-black shadow-lg">
                                    {job.company?.[0] || 'J'}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight" dangerouslySetInnerHTML={{ __html: job.title }} />
                                    <p className="text-slate-500 font-bold mt-1">{job.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4">
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    <Briefcase className="h-3.5 w-3.5" /> {job.workMode || 'On-site'}
                                </span>
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    <Clock className="h-3.5 w-3.5" /> {job.duration || '4 Months'}
                                </span>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-black text-slate-900 dark:text-white mb-3">About This Role</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {job.description?.replace(/<[^>]*>?/gm, '') || 'No description available for this position.'}
                            </p>
                        </div>

                        {/* AI Eligibility Analysis */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="font-black text-slate-900 dark:text-white">AI Eligibility Analysis</h3>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                                    <p className="text-sm font-bold text-slate-500">Analyzing your skills against job requirements...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-5 w-5" />
                                    <p className="font-bold text-sm">{error}</p>
                                    <button onClick={checkEligibility} className="ml-auto text-xs font-black underline">Retry</button>
                                </div>
                            ) : eligibility ? (
                                <div className="space-y-6">
                                    {/* Eligibility Score */}
                                    <div className={`p-6 rounded-2xl ${eligibility.isEligible ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {eligibility.isEligible ? (
                                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                                ) : (
                                                    <Target className="h-8 w-8 text-amber-500" />
                                                )}
                                                <div>
                                                    <h4 className={`font-black text-lg ${eligibility.isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                                        {eligibility.isEligible ? "You're Qualified!" : "Almost There!"}
                                                    </h4>
                                                    <p className="text-sm text-slate-500">{eligibility.summary}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-4xl font-black ${eligibility.isEligible ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {eligibility.eligibilityScore}%
                                                </span>
                                                <p className="text-xs font-bold text-slate-400">Match Score</p>
                                            </div>
                                        </div>

                                        {/* Skill Comparison */}
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <h5 className="text-xs font-black text-slate-500 uppercase mb-2">Matched Skills</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {eligibility.matchedSkills?.length > 0 ? eligibility.matchedSkills.map((skill, i) => (
                                                        <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                                            <CheckCircle2 className="h-3 w-3" /> {skill}
                                                        </span>
                                                    )) : <span className="text-xs text-slate-400">None matched</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black text-slate-500 uppercase mb-2">Missing Skills</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {eligibility.missingSkills?.length > 0 ? eligibility.missingSkills.map((skill, i) => (
                                                        <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                                                            <XCircle className="h-3 w-3" /> {skill}
                                                        </span>
                                                    )) : <span className="text-xs text-slate-400">None! Great match!</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Learning Roadmap (if not eligible) */}
                                    {!eligibility.isEligible && eligibility.roadmap && (
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                                            <div className="flex items-center gap-2 mb-4">
                                                <BookOpen className="h-5 w-5 text-indigo-500" />
                                                <h4 className="font-black text-indigo-700 dark:text-indigo-400">{eligibility.roadmap.title}</h4>
                                                <span className="ml-auto text-xs font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-lg">
                                                    {eligibility.roadmap.duration}
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {eligibility.roadmap.steps?.map((step, i) => (
                                                    <div key={i} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/50">
                                                        <h5 className="font-black text-slate-900 dark:text-white text-sm mb-2">{step.phase}</h5>
                                                        <p className="text-xs text-slate-500 mb-3">Learn: {step.skills?.join(', ')}</p>

                                                        {step.resources?.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {step.resources.map((resource, j) => (
                                                                    <a
                                                                        key={j}
                                                                        href={resource.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3" />
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

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleApply}
                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white font-black shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95"
                            >
                                <ExternalLink className="h-5 w-5" />
                                Apply Now
                            </button>
                            <button
                                onClick={onClose}
                                className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
