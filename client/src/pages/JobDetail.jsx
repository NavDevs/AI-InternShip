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
        window.open(job.link, '_blank');

        // Auto-save to tracker
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
            // Check if we already have questions matching the format, otherwise fetch
            const res = await axios.post(
                `${API_BASE_URL}/ai/interview-questions`,
                { role: job.title.replace(/<[^>]*>?/gm, '') },
                { headers: { 'X-User-ID': user?.uid || user?._id } }
            );

            generateQuestionsPDF(res.data);
        } catch (err) {
            console.error('Error fetching questions for PDF:', err);
            // Fallback: Generate PDF from displayed questions if API fails or verify if we can use eligibility data
            // But eligibility data might not have answers.
            alert('Could not generate PDF. Please try again.');
        } finally {
            setDownloadingQuestions(false);
        }
    };

    // Generate PDF from Interview Questions
    const generateQuestionsPDF = (data) => {
        const doc = new jsPDF();
        let yPos = 20;

        // Title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(`Interview Questions: ${data.role}`, 105, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total: ${data.totalQuestions} Questions | Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
        yPos += 15;

        // Iterate through each round
        if (data.questionsByRound) {
            Object.entries(data.questionsByRound).forEach(([round, questions]) => {
                // Add new page if needed
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                // Round header
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text(round, 20, yPos);
                yPos += 8;

                // Questions
                doc.setFontSize(10);
                questions.forEach((q, idx) => {
                    if (yPos > 260) {
                        doc.addPage();
                        yPos = 20;
                    }

                    // Question number and difficulty
                    doc.setFont(undefined, 'bold');
                    doc.text(`Q${idx + 1}. [${q.difficulty}]`, 20, yPos);
                    yPos += 5;

                    // Question
                    doc.setFont(undefined, 'normal');
                    const questionLines = doc.splitTextToSize(q.question, 170);
                    doc.text(questionLines, 20, yPos);
                    yPos += questionLines.length * 5 + 3;

                    // Answer
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

        // Footer on all pages
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

        // Download
        doc.save(`InterviewQuestions_${data.role.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!job) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto pb-20"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold mb-8 transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Jobs
            </button>

            {/* Job Header */}
            <div className="glass rounded-[2rem] p-8 mb-8">
                <div className="flex items-start gap-6 mb-6">
                    <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white text-3xl font-black shadow-lg shrink-0">
                        {job.company?.[0] || 'J'}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2" dangerouslySetInnerHTML={{ __html: job.title }} />
                        <p className="text-lg text-slate-500 font-bold">{job.company}</p>
                    </div>
                    <span className="px-4 py-2 rounded-full bg-orange-500 text-white text-xs font-black uppercase">
                        Paid
                    </span>
                </div>

                <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4" /> {job.location}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <Briefcase className="h-4 w-4" /> {job.workMode || 'On-site'}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <Clock className="h-4 w-4" /> {job.duration || 'Flexible'}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400">
                        <IndianRupee className="h-4 w-4" /> {job.fees || 'Paid'}
                    </span>
                </div>
            </div>

            {/* Job Description */}
            <div className="glass rounded-[2rem] p-8 mb-8">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">About This Role</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {job.description?.replace(/<[^>]*>?/gm, '') || 'No detailed description available. Click "Apply Now" to learn more on the company\'s website.'}
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-amber-600" />
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                            Job offer upto ₹ 3.0 LPA to 34 LPA (per annum) post Internship
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Eligibility Analysis */}
            <div className="glass rounded-[2rem] p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">AI Eligibility Analysis</h2>
                        <p className="text-sm text-slate-500">Comparing your skills with job requirements</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="font-bold text-slate-500">Analyzing your profile against job requirements...</p>
                        <p className="text-sm text-slate-400 mt-2">This may take a few seconds</p>
                    </div>
                ) : error ? (
                    <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                            <p className="font-bold text-red-600 dark:text-red-400">{error}</p>
                        </div>
                        <button
                            onClick={checkEligibility}
                            className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : eligibility ? (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className={`p-6 rounded-2xl ${eligibility.isEligible ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700' : 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {eligibility.isEligible ? (
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    ) : (
                                        <Target className="h-12 w-12 text-amber-500" />
                                    )}
                                    <div>
                                        <h3 className={`text-2xl font-black ${eligibility.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {eligibility.isEligible ? "You're Qualified!" : "Almost There!"}
                                        </h3>
                                        <p className="text-slate-500 font-medium">{eligibility.summary}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-5xl font-black ${eligibility.isEligible ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {eligibility.eligibilityScore}%
                                    </span>
                                    <p className="text-sm font-bold text-slate-400">Match Score</p>
                                </div>
                            </div>
                        </div>

                        {/* Skill Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" /> Matched Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {eligibility.matchedSkills?.length > 0 ? eligibility.matchedSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                                            {skill}
                                        </span>
                                    )) : <span className="text-slate-400 text-sm">No skills matched</span>}
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <h4 className="font-black text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                    <XCircle className="h-5 w-5" /> Missing Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {eligibility.missingSkills?.length > 0 ? eligibility.missingSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-bold">
                                            {skill}
                                        </span>
                                    )) : <span className="text-slate-400 text-sm">None! You're a great match!</span>}
                                </div>
                            </div>
                        </div>

                        {/* Interview Questions */}
                        {eligibility.interviewQuestions?.length > 0 && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-300 dark:border-blue-700">
                                <div className="flex items-center gap-3 mb-6">
                                    <HelpCircle className="h-6 w-6 text-blue-500" />
                                    <div className="flex items-center justify-between w-full">
                                        <h3 className="text-xl font-black text-blue-700 dark:text-blue-400">Previously Asked Interview Questions</h3>
                                        <button
                                            onClick={handleDownloadInterviewQuestions}
                                            disabled={downloadingQuestions}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all disabled:opacity-50"
                                        >
                                            {downloadingQuestions ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                            {downloadingQuestions ? 'Generating PDF...' : 'Download PDF'}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {eligibility.interviewQuestions.map((q, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-blue-100 dark:border-blue-900/50">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <p className="font-bold text-slate-900 dark:text-white">{q.question}</p>
                                                <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-black ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' :
                                                    q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' :
                                                        'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                                                    }`}>{q.difficulty}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold">{q.category}</span>
                                            </div>
                                            {q.tips && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400 italic">💡 Tip: {q.tips}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Learning Roadmap */}
                        {eligibility.roadmap && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-6 w-6 text-indigo-500" />
                                        <h3 className="text-xl font-black text-indigo-700 dark:text-indigo-400">{eligibility.roadmap.title}</h3>
                                    </div>
                                    <span className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                                        {eligibility.roadmap.duration}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {eligibility.roadmap.steps?.map((step, i) => (
                                        <div key={i} className="p-5 rounded-xl bg-white dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-900/50">
                                            <h4 className="font-black text-slate-900 dark:text-white mb-2">{step.phase}</h4>
                                            <p className="text-sm text-slate-500 mb-4">Skills to learn: {step.skills?.join(', ')}</p>

                                            {/* YouTube Playlist */}
                                            {step.skills?.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-black text-slate-400 uppercase mb-2">📺 YouTube Playlist</p>
                                                    <div className="flex flex-col gap-2">
                                                        {step.skills.map((skill, idx) => {
                                                            const playlist = getYouTubePlaylistForSkill(skill);
                                                            return (
                                                                <a
                                                                    key={idx}
                                                                    href={playlist.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-800"
                                                                >
                                                                    <Youtube className="h-5 w-5" />
                                                                    {playlist.name}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Certifications */}
                                            {step.certifications?.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs font-black text-slate-400 uppercase mb-2">🎓 Certifications</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.certifications.map((cert, j) => (
                                                            <a
                                                                key={j}
                                                                href={cert.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${cert.isFree
                                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                                                    : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                                                    }`}
                                                            >
                                                                <Award className="h-4 w-4" />
                                                                <span>{cert.name}</span>
                                                                <span className="text-xs opacity-70">({cert.provider})</span>
                                                                {cert.isFree && <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-xs">FREE</span>}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resources */}
                                            {step.resources?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-black text-slate-400 uppercase mb-2">📚 Resources</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.resources.map((resource, j) => (
                                                            <a
                                                                key={j}
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
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

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleApply}
                    className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-r from-primary to-blue-600 text-white text-lg font-black shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
                >
                    <ExternalLink className="h-6 w-6" />
                    Apply Now
                </button>
                <button
                    onClick={() => navigate('/jobs')}
                    className="px-10 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-lg font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Back
                </button>
            </div>
        </motion.div>
    );
};

export default JobDetail;
