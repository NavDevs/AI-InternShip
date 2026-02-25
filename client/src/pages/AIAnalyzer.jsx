import React, { useState } from 'react';
import axios from 'axios';
import {
    Sparkles,
    CheckCircle2,
    XCircle,
    Briefcase,
    MapPin,
    Building2,
    TrendingUp,
    AlertCircle,
    Zap,
    Target,
    FileText,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';

const AIAnalyzer = () => {
    const { user } = useAuth();
    const [jdText, setJdText] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!jdText.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/ai/analyze`,
                { jdText },
                {
                    headers: {
                        'X-User-ID': user?.uid || user?._id
                    }
                }
            );
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze the description. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16"
        >
            <header className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-3 w-3" /> AI Powered
                </div>
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Smart Match Analyzer</h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-lg">
                    Paste a job description and let our AI determine how well you match the role.
                </p>
            </header>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-stone-400" />
                        Paste Job Description
                    </h3>
                </div>

                <textarea
                    className="w-full h-48 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 p-4 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-stone-400"
                    placeholder="Paste any job description or internship posting here…"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !jdText.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <>Analyze <Zap className="h-4 w-4" /></>
                        )}
                    </button>
                </div>
            </div>

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Score */}
                        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center">
                            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-4">Overall Match Score</p>
                            <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" className="stroke-stone-100 dark:stroke-stone-800 fill-none" strokeWidth="8" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        className="stroke-primary fill-none transition-all duration-1000"
                                        strokeWidth="8"
                                        strokeDasharray={352}
                                        strokeDashoffset={352 - (352 * result.matchPercentage) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-3xl font-semibold text-stone-900 dark:text-stone-100">{result.matchPercentage}%</span>
                            </div>
                            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
                                {result.matchPercentage > 70 ? "Excellent match — go for it!" :
                                    result.matchPercentage > 40 ? "Good match — just bridge a few skill gaps." :
                                        "You'll need more skills to be competitive."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Role Details */}
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-indigo-600" /> Role Details
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Role', value: result.title },
                                        { label: 'Company', value: result.company },
                                        { label: 'Location', value: result.location },
                                        { label: 'Analyzed', value: new Date().toLocaleDateString() },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col border-b border-stone-100 dark:border-stone-800 pb-2.5 last:border-0 last:pb-0">
                                            <span className="text-xs text-stone-400">{item.label}</span>
                                            <span className="text-sm font-medium text-stone-800 dark:text-stone-200 capitalize">{item.value || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills Gap */}
                            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-600" /> Skill Gaps
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-xs text-stone-500 mb-2 flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Matched Skills
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.matchedSkills.length > 0 ? result.matchedSkills.map((s, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-xs capitalize">
                                                    {s}
                                                </span>
                                            )) : <span className="text-xs text-stone-400 italic">No matches found.</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-500 mb-2 flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Missing Skills
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-md text-xs capitalize">
                                                    {s}
                                                </span>
                                            )) : <span className="text-xs text-emerald-600">You have all core skills.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIAnalyzer;
