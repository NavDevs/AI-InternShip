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

        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('AI JOB MATCH ANALYSIS REPORT', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

        let yPos = 45;

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

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('MATCHED SKILLS', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (result.matchedSkills && result.matchedSkills.length > 0) {
            result.matchedSkills.forEach((skill) => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                doc.text(`✓ ${skill}`, 25, yPos);
                yPos += 6;
            });
        } else {
            doc.text('No matched skills found', 25, yPos);
            yPos += 6;
        }
        yPos += 10;

        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('MISSING SKILLS (Areas to Improve)', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (result.missingSkills && result.missingSkills.length > 0) {
            result.missingSkills.forEach((skill) => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                doc.text(`✗ ${skill}`, 25, yPos);
                yPos += 6;
            });
        } else {
            doc.text('Excellent! You have all core skills.', 25, yPos);
            yPos += 6;
        }
        yPos += 10;

        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('AI RECOMMENDATIONS', 20, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        if (result.suggestions && result.suggestions.length > 0) {
            result.suggestions.forEach((suggestion, i) => {
                if (yPos > 265) { doc.addPage(); yPos = 20; }
                const lines = doc.splitTextToSize(`${i + 1}. ${suggestion}`, 170);
                doc.text(lines, 20, yPos);
                yPos += lines.length * 6 + 4;
            });
        } else {
            doc.text('Keep building your skills and apply with confidence!', 20, yPos);
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text('Generated by Intern-AI - Smart Job Match Analyzer', 105, 285, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`AI_Analysis_${result.company || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16 font-outfit"
        >
            <header className="space-y-2">
                <div className="inline-flex items-center gap-1.5 glass-panel rounded-full px-4 py-1.5 text-xs font-medium text-brand-300 border border-brand-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Sparkles className="h-3.5 w-3.5 text-brand-400" /> AI Powered
                </div>
                <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">Smart Match Analyzer</h1>
                <p className="text-sm text-text-secondary max-w-lg">
                    Paste a job description and let our AI determine how well you match the role.
                </p>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-sm text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto p-1.5 hover:bg-red-500/20 rounded transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-400" />
                        Paste Job Description
                    </h3>
                </div>

                <textarea
                    className="w-full h-48 rounded-xl glass-input p-5 text-sm focus:outline-none resize-none placeholder:text-text-muted"
                    placeholder="Paste any job description or internship posting here…"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                />
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !jdText.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50 border border-brand-500"
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
                        <div className="glass-panel rounded-2xl p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-transparent pointer-events-none"></div>
                            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-6 relative z-10">Overall Match Score</p>
                            <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" className="stroke-white/10 fill-none" strokeWidth="8" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        className="stroke-brand-500 fill-none transition-all duration-1000"
                                        strokeWidth="8"
                                        strokeDasharray={352}
                                        strokeDashoffset={352 - (352 * result.matchPercentage) / 100}
                                        strokeLinecap="round"
                                        style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.6))' }}
                                    />
                                </svg>
                                <span className="absolute text-3xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{result.matchPercentage}%</span>
                            </div>
                            <p className="mt-6 text-sm font-medium text-brand-100 relative z-10">
                                {result.matchPercentage > 70 ? "Excellent match — go for it!" :
                                    result.matchPercentage > 40 ? "Good match — just bridge a few skill gaps." :
                                        "You'll need more skills to be competitive."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Role Details */}
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                                    <Target className="h-4 w-4 text-brand-400" /> Role Details
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Role', value: result.title },
                                        { label: 'Company', value: result.company },
                                        { label: 'Location', value: result.location },
                                        { label: 'Analyzed', value: new Date().toLocaleDateString() },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                            <span className="text-[10px] uppercase tracking-wider text-text-muted mb-1">{item.label}</span>
                                            <span className="text-sm font-medium text-brand-50 capitalize">{item.value || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills Gap */}
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-orange-400" /> Skill Gaps
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> Matched Skills
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.matchedSkills.length > 0 ? result.matchedSkills.map((s, i) => (
                                                <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium capitalize shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                    {s}
                                                </span>
                                            )) : <span className="text-xs text-text-muted italic">No matches found.</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> Missing Skills
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                                                <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium capitalize shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                                    {s}
                                                </span>
                                            )) : <span className="text-xs text-emerald-400 font-medium">You have all core skills.</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleDownloadReport}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
                            >
                                <FileText className="h-4 w-4 text-brand-400" />
                                Download PDF Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AIAnalyzer;
