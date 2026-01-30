import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
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



    const handleDownloadReport = () => {
        if (!result) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('AI JOB MATCH ANALYSIS REPORT', 105, 20, { align: 'center' });

        // Date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

        let yPos = 45;

        // Overall Match Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('OVERALL MATCH', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Match Percentage: ${result.matchPercentage}%`, 20, yPos);
        yPos += 6;
        doc.text(`Status: ${result.feedback || 'Good Match! Just bridge a few gaps.'}`, 20, yPos);
        yPos += 15;

        // Role Details Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('ROLE DETAILS', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Position: ${result.title || 'N/A'}`, 20, yPos);
        yPos += 6;
        doc.text(`Company: ${result.company || 'N/A'}`, 20, yPos);
        yPos += 6;
        doc.text(`Location: ${result.location || 'N/A'}`, 20, yPos);
        yPos += 15;

        // Matched Skills Section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('MATCHED SKILLS', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (result.matchedSkills && result.matchedSkills.length > 0) {
            result.matchedSkills.forEach((skill) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`✓ ${skill}`, 25, yPos);
                yPos += 6;
            });
        } else {
            doc.text('No matched skills found', 25, yPos);
            yPos += 6;
        }
        yPos += 10;

        // Missing Skills Section
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('MISSING SKILLS (Areas to Improve)', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (result.missingSkills && result.missingSkills.length > 0) {
            result.missingSkills.forEach((skill) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`✗ ${skill}`, 25, yPos);
                yPos += 6;
            });
        } else {
            doc.text('Excellent! You have all core skills.', 25, yPos);
            yPos += 6;
        }
        yPos += 10;

        // AI Recommendations Section
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('AI RECOMMENDATIONS', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (result.suggestions && result.suggestions.length > 0) {
            result.suggestions.forEach((suggestion, i) => {
                if (yPos > 265) {
                    doc.addPage();
                    yPos = 20;
                }
                const lines = doc.splitTextToSize(`${i + 1}. ${suggestion}`, 170);
                doc.text(lines, 20, yPos);
                yPos += lines.length * 6 + 4;
            });
        } else {
            doc.text('Keep building your skills and apply with confidence!', 20, yPos);
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text('Generated by Intern-AI - Smart Job Match Analyzer', 105, 285, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        // Save the PDF
        doc.save(`AI_Analysis_${result.company || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20"
        >
            <header className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-blue-600 dark:text-blue-400 text-sm font-bold mb-4"
                >
                    <Sparkles className="h-4 w-4" /> AI Powered Analysis
                </motion.div>
                <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Smart Match Analyzer</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                    Paste a job description and let our AI determine how well you match the role and what skills you might be missing.
                </p>
            </header>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400"
                >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{error}</span>
                    <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded-lg">
                        <X className="h-4 w-4" />
                    </button>
                </motion.div>
            )}

            {/* Job Description Input Section */}
            <section className="glass rounded-[2.5rem] p-8 shadow-sm dark:bg-slate-900/50">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        Paste Job Description
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Paste any job description or internship posting to analyze your match
                    </p>
                </div>

                <textarea
                    className="w-full h-64 rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400"
                    placeholder="Paste any job description or internship posting here and click Analyze to see your match percentage..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                />
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-6">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !jdText.trim()}
                        className="flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-primary px-12 py-4 font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <>Analyze Description <Zap className="h-5 w-5" /></>
                        )}
                    </button>
                </div>
            </section>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-10"
                    >
                        <div className="glass rounded-[2.5rem] p-10 text-center border-2 border-blue-100 dark:border-blue-900/30 overflow-hidden relative dark:bg-slate-900/50">
                            <div className="relative z-10 flex flex-col items-center">
                                <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Overall Match Score</h2>
                                <div className="relative h-40 w-40 flex items-center justify-center">
                                    <svg className="h-full w-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="12" />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            className="stroke-primary fill-none transition-all duration-1000"
                                            strokeWidth="12"
                                            strokeDasharray={440}
                                            strokeDashoffset={440 - (440 * result.matchPercentage) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-5xl font-black text-slate-900 dark:text-white">{result.matchPercentage}%</span>
                                </div>
                                <p className="mt-8 text-xl font-bold text-slate-700 dark:text-slate-300">
                                    {result.matchPercentage > 70 ? "🔥 Excellent Match! Go for it." :
                                        result.matchPercentage > 40 ? "🚀 Good Match! Just bridge a few gaps." :
                                            "🔍 Needs more skills to be competitive."}
                                </p>
                            </div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass p-8 rounded-3xl dark:bg-slate-900/50"
                            >
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Target className="h-5 w-5 text-secondary" /> Role Details
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Potential Role', value: result.title },
                                        { label: 'Company Name', value: result.company },
                                        { label: 'Location', value: result.location },
                                        { label: 'Analysis Date', value: new Date().toLocaleDateString() },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-bold mt-1 text-lg capitalize">{item.value || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass p-8 rounded-3xl dark:bg-slate-900/50"
                            >
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" /> Skill Gaps
                                </h3>
                                <div className="space-y-8">
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Matched Skills
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.matchedSkills.length > 0 ? result.matchedSkills.map((s, i) => (
                                                <span key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold capitalize border border-emerald-100 dark:border-emerald-900/30">
                                                    {s}
                                                </span>
                                            )) : <span className="text-sm text-slate-400 italic">No matches found.</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Missing Skills
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                                                <span key={i} className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold capitalize border border-rose-100 dark:border-rose-900/30">
                                                    {s}
                                                </span>
                                            )) : <span className="text-sm text-emerald-500 font-bold">Excellent! You have all core skills.</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="flex justify-center pt-10">
                            <button
                                onClick={handleDownloadReport}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-12 py-4 font-bold text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Download Analysis Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIAnalyzer;
