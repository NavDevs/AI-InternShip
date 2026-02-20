import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Sparkles,
    ExternalLink,
    AlertTriangle,
    BookOpen,
    Target,
    IndianRupee,
    Tag,
    Youtube,
    Award,
    HelpCircle,
    Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import { db } from '../firebase';
import { API_BASE_URL } from '../utils/api';
import { collection, addDoc } from 'firebase/firestore';
import { getYouTubePlaylistForSkill } from '../constants/youtubeLinks';

const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
};

const JobDetail = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const job = location.state?.job;

    const [eligibility, setEligibility] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadingQuestions, setDownloadingQuestions] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!job) {
            navigate('/jobs');
            return;
        }
        checkEligibility();
    }, [job]);

    const checkEligibility = async () => {
        if (!user || !job) return;
        setLoading(true);
        setError(null);
        try {
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
                { headers: { 'X-User-ID': user.uid } }
            );
            setEligibility(res.data);
        } catch (err) {
            console.error('Eligibility check failed:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Unknown error';
            setError(`Analysis failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        window.open(ensureAbsoluteUrl(job.link), '_blank');
        if (user) {
            try {
                await addDoc(collection(db, 'applications'), {
                    company: job.company,
                    role: job.title?.replace(/<[^>]*>?/gm, ''),
                    status: 'Applied',
                    appliedDate: new Date().toISOString(),
                    location: job.location,
                    userId: user.uid,
                    source: job.source || 'Intern-AI'
                });
            } catch (err) {
                console.error('Failed to save to tracker:', err);
            }
        }
    };

    const handleDownloadInterviewQuestions = async () => {
        if (!job) return;
        setDownloadingQuestions(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/ai/interview-questions`,
                { role: job.title.replace(/<[^>]*>?/gm, '') },
                { headers: { 'X-User-ID': user?.uid || user?._id } }
            );
            generateQuestionsPDF(res.data);
        } catch (err) {
            console.error('Error fetching questions for PDF:', err);
            alert('Could not generate PDF. Please try again.');
        } finally {
            setDownloadingQuestions(false);
        }
    };

    const generateQuestionsPDF = (data) => {
        const doc = new jsPDF();
        let yPos = 20;
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`Interview Questions: ${data.role}`, 105, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total: ${data.totalQuestions} Questions | Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
        yPos += 15;

        if (data.questionsByRound) {
            Object.entries(data.questionsByRound).forEach(([round, questions]) => {
                if (yPos > 250) { doc.addPage(); yPos = 20; }
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(round, 20, yPos);
                yPos += 8;
                doc.setFontSize(10);
                questions.forEach((q, idx) => {
                    if (yPos > 260) { doc.addPage(); yPos = 20; }
                    doc.setFont(undefined, 'bold');
                    doc.text(`Q${idx + 1}. [${q.difficulty}]`, 20, yPos);
                    yPos += 5;
                    doc.setFont(undefined, 'normal');
                    const questionLines = doc.splitTextToSize(q.question, 170);
                    doc.text(questionLines, 20, yPos);
                    yPos += questionLines.length * 5 + 3;
                    doc.setFont(undefined, 'italic');
                    doc.setTextColor(60, 60, 60);
                    const answerLines = doc.splitTextToSize(`Answer: ${q.answer}`, 170);
                    doc.text(answerLines, 20, yPos);
                    doc.setTextColor(0, 0, 0);
                    yPos += answerLines.length * 5 + 8;
                });
                yPos += 5;
            });
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(120, 120, 120);
            doc.text('Prepared by Intern-AI Career Coach', 105, 290, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.setTextColor(0, 0, 0);
        }
        doc.save(`InterviewQuestions_${data.role.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!job) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto pb-16 animate-fade-in"
        >
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
            </button>

            {/* Job Header */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 mb-5">
                <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary text-white text-lg font-semibold shrink-0">
                        {job.company?.[0] || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 leading-snug" dangerouslySetInnerHTML={{ __html: job.title }} />
                        <p className="text-sm text-stone-500 mt-0.5">{job.company}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium shrink-0">
                        Paid
                    </span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                        <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                        <Briefcase className="h-3 w-3" /> {job.workMode || 'On-site'}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                        <Clock className="h-3 w-3" /> {job.duration || 'Flexible'}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-400">
                        <IndianRupee className="h-3 w-3" /> {job.fees || 'Paid'}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 mb-5">
                <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">About This Role</h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {job.description?.replace(/<[^>]*>?/gm, '') || 'No detailed description available. Click "Apply Now" to learn more on the company\'s website.'}
                </p>

                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-amber-600" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            Job offer upto ₹ 3.0 LPA to 34 LPA (per annum) post Internship
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Eligibility */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 mb-5">
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI Eligibility Analysis</h2>
                        <p className="text-xs text-stone-500">Comparing your skills with job requirements</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 rounded-lg bg-stone-50 dark:bg-stone-800">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                        <p className="text-sm text-stone-500">Analyzing your profile…</p>
                        <p className="text-xs text-stone-400 mt-1">This may take a few seconds</p>
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                        <button
                            onClick={checkEligibility}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : eligibility ? (
                    <div className="space-y-5">
                        {/* Score */}
                        <div className={`p-5 rounded-lg ${eligibility.isEligible ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {eligibility.isEligible ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    ) : (
                                        <Target className="h-8 w-8 text-amber-500" />
                                    )}
                                    <div>
                                        <h3 className={`text-base font-semibold ${eligibility.isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                            {eligibility.isEligible ? "You're Qualified!" : "Almost There!"}
                                        </h3>
                                        <p className="text-xs text-stone-500 mt-0.5">{eligibility.summary}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-3xl font-semibold ${eligibility.isEligible ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {eligibility.eligibilityScore}%
                                    </span>
                                    <p className="text-xs text-stone-400">Match</p>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800">
                                <h4 className="text-xs font-medium text-emerald-600 mb-2.5 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> Matched Skills
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {eligibility.matchedSkills?.length > 0 ? eligibility.matchedSkills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">
                                            {skill}
                                        </span>
                                    )) : <span className="text-xs text-stone-400">No skills matched</span>}
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-800">
                                <h4 className="text-xs font-medium text-rose-600 mb-2.5 flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5" /> Missing Skills
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {eligibility.missingSkills?.length > 0 ? eligibility.missingSkills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs">
                                            {skill}
                                        </span>
                                    )) : <span className="text-xs text-stone-400">None — great match!</span>}
                                </div>
                            </div>
                        </div>

                        {/* Interview Questions */}
                        {eligibility.interviewQuestions?.length > 0 && (
                            <div className="p-5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <HelpCircle className="h-4 w-4 text-blue-500" />
                                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex-1">Previously Asked Questions</h3>
                                    <button
                                        onClick={handleDownloadInterviewQuestions}
                                        disabled={downloadingQuestions}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-medium transition-colors disabled:opacity-50"
                                    >
                                        {downloadingQuestions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                        {downloadingQuestions ? 'Generating…' : 'Download PDF'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {eligibility.interviewQuestions.map((q, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700">
                                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{q.question}</p>
                                                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' :
                                                    q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>{q.difficulty}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px]">{q.category}</span>
                                            {q.tips && (
                                                <p className="text-xs text-stone-500 mt-2 italic">💡 {q.tips}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Learning Roadmap */}
                        {eligibility.roadmap && (
                            <div className="p-5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-indigo-500" />
                                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{eligibility.roadmap.title}</h3>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs">
                                        {eligibility.roadmap.duration}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {eligibility.roadmap.steps?.map((step, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700">
                                            <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">{step.phase}</h4>
                                            <p className="text-xs text-stone-500 mb-3">Skills: {step.skills?.join(', ')}</p>

                                            {step.skills?.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs text-stone-400 mb-1.5">YouTube Playlists</p>
                                                    <div className="flex flex-col gap-1.5">
                                                        {step.skills.map((skill, idx) => {
                                                            const playlist = getYouTubePlaylistForSkill(skill);
                                                            return (
                                                                <a
                                                                    key={idx}
                                                                    href={ensureAbsoluteUrl(playlist.url)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                                                >
                                                                    <Youtube className="h-3.5 w-3.5" />
                                                                    {playlist.name}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {step.certifications?.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-xs text-stone-400 mb-1.5">Certifications</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {step.certifications.map((cert, j) => (
                                                            <a
                                                                key={j}
                                                                href={ensureAbsoluteUrl(cert.url)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors border ${cert.isFree
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50 hover:bg-emerald-100'
                                                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50 hover:bg-amber-100'
                                                                    }`}
                                                            >
                                                                <Award className="h-3 w-3" />
                                                                <span>{cert.name}</span>
                                                                <span className="opacity-60">({cert.provider})</span>
                                                                {cert.isFree && <span className="px-1 py-0.5 rounded bg-emerald-500 text-white text-[9px]">FREE</span>}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {step.resources?.length > 0 && (
                                                <div>
                                                    <p className="text-xs text-stone-400 mb-1.5">Resources</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {step.resources.map((resource, j) => (
                                                            <a
                                                                key={j}
                                                                href={ensureAbsoluteUrl(resource.url)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                                            >
                                                                <ExternalLink className="h-3 w-3" />
                                                                {resource.name}
                                                            </a>
                                                        ))}
                                                    </div>
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
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                    Apply Now
                </button>
                <button
                    onClick={() => navigate('/jobs')}
                    className="px-6 py-3 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm text-stone-600 dark:text-stone-400 font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                    Back
                </button>
            </div>
        </motion.div>
    );
};

export default JobDetail;
