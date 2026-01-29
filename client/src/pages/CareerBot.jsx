import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    Sparkles,
    Send,
    Bot,
    User,
    ChevronRight,
    Target,
    Zap,
    BookOpen,
    Calendar,
    ArrowRight,
    Award,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getYouTubePlaylistForSkill } from '../constants/youtubeLinks';
import { Youtube } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const CareerBot = () => {
    const { user } = useAuth();
    const [mode, setMode] = useState('menu'); // 'menu', 'analyze', 'roadmap'
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'bot', content: `Hey ${user?.name?.split(' ')[0] || 'there'}! I'm your AI Career Coach. How can I help you today?` }
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newUserMessage = { role: 'user', content: inputText };
        setMessages(prev => [...prev, newUserMessage]);
        const userInput = inputText.trim();
        setInputText('');
        setLoading(true);

        // Detect if the message is a greeting
        const isGreeting = /^(hi|hello|hey|hola|yo|help|who are you)/i.test(userInput);

        // Smart detection: Auto-trigger roadmap for career-related keywords (includes tech stacks)
        const isCareerQuery = /\b(developer|engineer|designer|manager|analyst|scientist|architect|devops|frontend|backend|fullstack|full stack|data|cloud|machine learning|ml|ai|software|web|mobile|ios|android|product|ux|ui|security|blockchain|marketing|sales|hr|finance|consultant|intern|fresher|career|job|role|position|become|want to be|how to become|mern|mean|lamp|python|java|react|angular|vue|node|django|flask|spring|dotnet|golang|rust|ruby|php|c\+\+|csharp|kotlin|swift|flutter|aws|azure|gcp|docker|kubernetes|cybersecurity|penetration|ethical hacker|network|sysadmin|dba|qa|tester|scrum|agile)\b/i.test(userInput);

        // Determine actual mode based on smart detection (allow short career keywords like "MERN")
        let effectiveMode = mode;
        if (mode === 'menu' && isCareerQuery && !isGreeting) {
            effectiveMode = 'roadmap'; // Auto-switch to roadmap for career queries
        }

        try {
            if (effectiveMode === 'menu' || isGreeting) {
                // General Chat
                setResult(null); // Clear previous results to show idle screen
                const res = await axios.post(`${API_BASE_URL}/ai/chat`,
                    {
                        message: userInput,
                        chatHistory: messages.map(m => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: m.content }] }))
                    },
                    { headers: { 'X-User-ID': user?.uid || user?._id } }
                );
                setMessages(prev => [...prev, { role: 'bot', content: res.data.text }]);
            } else if (effectiveMode === 'analyze') {
                const res = await axios.post(`${API_BASE_URL}/ai/analyze`,
                    { jdText: userInput },
                    { headers: { 'X-User-ID': user?.uid || user?._id } }
                );
                setResult(res.data);
                setMessages(prev => [...prev, { role: 'bot', content: `Based on my analysis, your match score for this role is ${res.data.matchPercentage}%. I've generated an eligibility report for you below!` }]);
            } else if (effectiveMode === 'roadmap') {
                const res = await axios.post(`${API_BASE_URL}/ai/roadmap`,
                    { dreamJob: userInput },
                    { headers: { 'X-User-ID': user?.uid || user?._id } }
                );
                setResult(res.data);
                setMessages(prev => [...prev, { role: 'bot', content: `I've crafted a personalized 6-month roadmap for you to become a ${res.data.dreamJob}. Check it out!` }]);
                // Reset mode after successful roadmap generation for fresh interactions
                setMode('menu');
            }
        } catch (err) {
            const status = err.response?.status;
            let message = "Sorry, something went wrong. Please try again.";

            if (status === 429) {
                message = "⏳ I'm a bit overwhelmed right now! The AI service has a rate limit. Please wait **30 seconds** before trying again.";
            } else if (status === 500) {
                message = "Oops! The AI service encountered an error. Please try again in a moment.";
            } else if (!err.response) {
                message = "I can't reach the server. Please check your internet connection.";
            }

            setMessages(prev => [...prev, { role: 'bot', content: message }]);
        } finally {
            setLoading(false);
        }
    };

    const timelineVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-float" style={{ animationDelay: '2s' }} />

            <header className="flex flex-col items-center text-center space-y-6 pt-12">
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="p-1 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/20"
                >
                    <div className="h-20 w-20 bg-white dark:bg-slate-900 rounded-[1.4rem] flex items-center justify-center">
                        <Bot className="h-10 w-10 text-indigo-600 animate-pulse" />
                    </div>
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
                        Career <span className="text-gradient">Architect</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold text-xl max-w-2xl mx-auto leading-relaxed">
                        Precision-engineered AI for your professional evolution.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Chat Panel */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="lg:col-span-4 h-[780px] flex flex-col glass-morphic rounded-[3rem] overflow-hidden border border-white/40 dark:border-slate-800/50 shadow-2xl"
                >
                    <div className="p-6 border-b border-white/20 dark:border-slate-800 bg-white/20 dark:bg-slate-900/30 backdrop-blur-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white text-base">Vision AI</h3>
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> System Active
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setMode('menu'); setResult(null); setMessages([{ role: 'bot', content: `Hey ${user?.name.split(' ')[0]}! I'm your AI Career Coach. How can I help you today?` }]); }}
                            className="p-2.5 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-2xl transition-all hover:scale-110 active:scale-90"
                        >
                            <Zap className="h-5 w-5 text-indigo-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`max-w-[88%] p-5 rounded-[1.8rem] text-sm font-semibold leading-relaxed shadow-lg backdrop-blur-md ${msg.role === 'bot'
                                    ? 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-white/50 dark:border-slate-700/50'
                                    : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-sm shadow-indigo-500/20'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/40 dark:bg-slate-800/40 p-5 rounded-[1.8rem] rounded-tl-none border border-white/20 dark:border-slate-700/20 flex gap-2 items-center">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" />
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-6 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md border-t border-white/10 dark:border-slate-800 space-y-4">
                        {mode === 'menu' && (
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setMode('analyze'); setMessages(p => [...p, { role: 'bot', content: "Synchronizing with JD analysis module. Please provide the Job Description." }]); }}
                                    className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/90 rounded-2xl flex flex-col items-center gap-2 transition-all shadow-md group border border-white/40 dark:border-slate-700/40"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Eligibility</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setMode('roadmap'); setMessages(p => [...p, { role: 'bot', content: "Initializing Career Path mapping. Target designation?" }]); }}
                                    className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/90 rounded-2xl flex flex-col items-center gap-2 transition-all shadow-md group border border-white/40 dark:border-slate-700/40"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Roadmap</span>
                                </motion.button>
                            </div>
                        )}

                        <div className="flex gap-3 relative items-center">
                            <input
                                type="text"
                                placeholder={mode === 'analyze' ? 'Paste JD content here...' : mode === 'roadmap' ? 'Target job title...' : 'Ask me anything...'}
                                className="w-full bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/50 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none dark:text-white transition-all shadow-inner"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSend}
                                disabled={!inputText.trim() || loading}
                                className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Send className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Display Panel */}
                <div className="lg:col-span-8 min-h-[780px] relative">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-16 glass-morphic rounded-[4rem] border-2 border-indigo-200/50 dark:border-slate-800"
                            >
                                <div className="relative">
                                    <div className="h-32 w-32 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center animate-pulse">
                                        <Bot className="h-16 w-16 text-indigo-600 animate-bounce" />
                                    </div>
                                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-8 mb-2">Analyzing Career Matrix...</h3>
                                <p className="text-slate-500 font-bold">Constructing personalized trajectory.</p>
                            </motion.div>
                        ) : !result ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-16 glass-morphic rounded-[4rem] border-2 border-dashed border-indigo-200 dark:border-slate-800"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -z-10 opacity-10"
                                >
                                    <div className="w-[500px] h-[500px] border-[40px] border-indigo-500 rounded-full" />
                                </motion.div>

                                <div className="h-40 w-40 bg-indigo-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
                                    <Sparkles className="h-16 w-16 text-indigo-400" />
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 italic">Vision Engine Idle</h3>
                                <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto leading-relaxed">
                                    Awaiting input data. Feed me a Job Description or a career goal to activate analysis.
                                </p>
                            </motion.div>
                        ) : result.phases ? (
                            /* Roadmap Result UI - PREMIUM TIMELINE */
                            <motion.div
                                key="roadmap"
                                initial="hidden" animate="visible" variants={timelineVariants}
                                className="space-y-8"
                            >
                                <div className="glass-morphic rounded-[3.5rem] p-12 border border-white/40 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden shadow-2xl">
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div>
                                            <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] rounded-2xl">
                                                <Target className="h-4 w-4" /> Stratos Roadmap
                                            </div>
                                            <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">Objective: <span className="text-gradient">{result.dreamJob}</span></h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Duration</p>
                                            <p className="text-2xl font-black dark:text-white">6 Standard Months</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8 relative px-4">
                                    <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-20 hidden md:block" />

                                    {result.phases.map((phase, i) => (
                                        <motion.div
                                            key={i}
                                            variants={itemVariants}
                                            className={`relative flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-stretch gap-8`}
                                        >
                                            <div className="absolute left-1/2 -translate-x-1/2 h-10 w-10 rounded-2xl bg-white dark:bg-slate-900 border-4 border-indigo-600 shadow-xl z-10 hidden md:flex items-center justify-center font-black text-indigo-600 text-xs">
                                                {i + 1}
                                            </div>

                                            <div className="flex-1 w-full">
                                                <div className="glass-morphic p-6 sm:p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800 hover:scale-[1.01] transition-all transform shadow-2xl group h-full flex flex-col">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex-1 pr-4">
                                                            <span className="text-xs sm:text-sm font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 block">{phase.month}</span>
                                                            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">{phase.topics[0]}</h4>
                                                        </div>
                                                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-lg">
                                                            <BookOpen className="h-6 w-6" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 flex-1">
                                                        {phase.actionItems.map((item, j) => (
                                                            <div key={j} className="flex items-start gap-3 p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm">
                                                                <div className="h-6 w-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-snug break-words">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Verified YouTube Links for Topics */}
                                                    <div className="mt-4 pt-4 border-t border-white/20 dark:border-slate-800">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recommended Training</p>
                                                        <div className="flex flex-col gap-2">
                                                            {phase.topics?.slice(0, 2).map((topic, idx) => {
                                                                const playlist = getYouTubePlaylistForSkill(topic);
                                                                return (
                                                                    <a
                                                                        key={idx}
                                                                        href={playlist.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100/50 dark:border-red-800/50"
                                                                    >
                                                                        <Youtube className="h-4 w-4 shrink-0" />
                                                                        <span className="truncate">{playlist.name}</span>
                                                                    </a>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 hidden md:block" />
                                        </motion.div>
                                    ))}

                                    <motion.div variants={itemVariants} className="mt-12">
                                        <div className="flex items-center gap-5 mb-8">
                                            <div className="h-14 w-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-orange-500/30">
                                                <Zap className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Arsenal of Resources</h4>
                                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Expert-vetted material for rapid advancement.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {result.recommendedResources && result.recommendedResources.map((res, i) => {
                                                // Handle both string format and object format
                                                const resourceName = typeof res === 'string' ? res : res.name;
                                                const resourceUrl = typeof res === 'string' ? null : res.url;

                                                return (
                                                    <motion.a
                                                        key={i}
                                                        href={resourceUrl || '#'}
                                                        target={resourceUrl ? "_blank" : undefined}
                                                        rel={resourceUrl ? "noopener noreferrer" : undefined}
                                                        whileHover={{ y: -5, scale: 1.02 }}
                                                        className="group relative p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 cursor-pointer overflow-hidden flex flex-col justify-between h-full hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                                                    >
                                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <BookOpen className="h-24 w-24 -rotate-12" />
                                                        </div>

                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                                            </div>
                                                            <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 -rotate-45 group-hover:rotate-0 transition-all duration-300" />
                                                        </div>

                                                        <div>
                                                            <h5 className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {resourceName}
                                                            </h5>
                                                            {resourceUrl && (
                                                                <p className="text-[10px] font-bold text-slate-400 mt-2 truncate uppercase tracking-wider">
                                                                    {new URL(resourceUrl).hostname.replace('www.', '')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </motion.a>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            /* Eligibility Result UI - MODERN ANALYTICS */
                            <motion.div
                                key="eligibility"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-10"
                            >
                                <div className="glass-morphic rounded-[4rem] p-12 border border-white/40 dark:border-slate-800 relative overflow-hidden bg-white/40 dark:bg-slate-900/40 shadow-2xl">
                                    <div className="flex flex-col xl:flex-row items-center gap-16 relative z-10">
                                        <div className="relative h-60 w-60 flex items-center justify-center">
                                            <svg className="h-full w-full transform -rotate-90">
                                                <circle cx="120" cy="120" r="100" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="20" />
                                                <motion.circle
                                                    initial={{ strokeDashoffset: 628 }}
                                                    animate={{ strokeDashoffset: 628 - (628 * result.matchPercentage) / 100 }}
                                                    transition={{ duration: 2, ease: "circOut" }}
                                                    cx="120" cy="120" r="100"
                                                    className={`fill-none shadow-2xl ${result.matchPercentage > 80 ? 'stroke-emerald-500' : result.matchPercentage > 50 ? 'stroke-indigo-500' : 'stroke-rose-500'}`}
                                                    strokeWidth="20" strokeDasharray={628} strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute text-center">
                                                <span className="text-6xl font-black text-slate-900 dark:text-white block tracking-tighter">{result.matchPercentage}%</span>
                                                <span className="text-xs font-black uppercase text-slate-400 tracking-[0.3em]">Synapse Match</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center xl:items-start text-center xl:text-left space-y-6">
                                            <div className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border-2 ${result.isEligible
                                                ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600 dark:bg-emerald-900/20'
                                                : 'bg-rose-50 border-rose-500/30 text-rose-600 dark:bg-rose-900/20'
                                                }`}>
                                                {result.isEligible ? 'Optimal Fit: Ready for Infiltration' : 'Warning: Compatibility Disconnect'}
                                            </div>
                                            <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight underline decoration-indigo-500/30 decoration-8 underline-offset-8">
                                                {result.title}
                                            </h2>
                                            <div className="flex items-center gap-3 text-lg font-black text-slate-500">
                                                <span className="text-indigo-600">{result.company}</span>
                                                <span className="h-2 w-2 rounded-full bg-slate-300" />
                                                <span>{result.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] text-white shadow-2xl relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                                            <Bot className="h-32 w-32" />
                                        </div>
                                        <div className="flex gap-6 items-start relative z-10">
                                            <div className="h-16 w-16 bg-white/20 rounded-[1.6rem] flex items-center justify-center shrink-0 backdrop-blur-md">
                                                <Zap className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-xl mb-2 text-white/80 uppercase tracking-widest">Executive Advice</h4>
                                                <p className="text-xl font-bold italic leading-relaxed">"{result.advice}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                    <div className="glass-morphic p-10 rounded-[3.5rem] border-2 border-rose-500/20 bg-rose-500/5">
                                        <h4 className="text-2xl font-black text-rose-600 mb-8 flex items-center gap-4">
                                            <div className="h-10 w-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                                                <ArrowRight className="h-6 w-6 rotate-45" />
                                            </div>
                                            Skills Gaps Detected
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                                                <span key={i} className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-black border border-rose-100 dark:border-slate-800 shadow-md transform hover:-translate-y-1 transition-transform">
                                                    {s}
                                                </span>
                                            )) : <span className="text-lg text-slate-500 font-bold italic">Perfect Match. Proceed to offer phase.</span>}
                                        </div>
                                    </div>
                                    <div className="glass-morphic p-10 rounded-[3.5rem] border-2 border-emerald-500/20 bg-emerald-500/5">
                                        <h4 className="text-2xl font-black text-emerald-600 mb-8 flex items-center gap-4">
                                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                            Strategic Assets
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {result.matchedSkills.length > 0 ? result.matchedSkills.map((s, i) => (
                                                <span key={i} className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-sm font-black border border-emerald-100 dark:border-slate-800 shadow-md transform hover:-translate-y-1 transition-transform">
                                                    {s}
                                                </span>
                                            )) : <span className="text-lg text-slate-500 font-bold italic">No direct matches found.</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};


export default CareerBot;

// Helper icons
const XCircle = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

