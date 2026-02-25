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
    CheckCircle2,
    Lightbulb,
    TrendingUp,
    FileQuestion
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getYouTubePlaylistForSkill } from '../constants/youtubeLinks';
import { Youtube } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const CareerBot = () => {
    const { user } = useAuth();
    const [mode, setMode] = useState('menu');
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'bot', content: `Hey ${user?.name?.split(' ')[0] || 'there'}! I'm your AI Career Coach. How can I help you today?` }
    ]);
    const [careerAdvice, setCareerAdvice] = useState(null);
    const [interviewQuestions, setInterviewQuestions] = useState(null);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
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

        const isGreeting = /^(hi|hello|hey|hola|yo|help|who are you)/i.test(userInput);
        const isCareerQuery = /\b(developer|engineer|designer|manager|analyst|scientist|architect|devops|frontend|backend|fullstack|full stack|data|cloud|machine learning|ml|ai|software|web|mobile|ios|android|product|ux|ui|security|blockchain|marketing|sales|hr|finance|consultant|intern|fresher|career|job|role|position|become|want to be|how to become|mern|mean|lamp|python|java|react|angular|vue|node|django|flask|spring|dotnet|golang|rust|ruby|php|c\+\+|csharp|kotlin|swift|flutter|aws|azure|gcp|docker|kubernetes|cybersecurity|penetration|ethical hacker|network|sysadmin|dba|qa|tester|scrum|agile)\b/i.test(userInput);

        let effectiveMode = mode;
        if (mode === 'menu' && isCareerQuery && !isGreeting) {
            effectiveMode = 'roadmap';
        }

        try {
            if (effectiveMode === 'menu' || isGreeting) {
                setResult(null);
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
                setMessages(prev => [...prev, { role: 'bot', content: `Your match score for this role is ${res.data.matchPercentage}%. I've generated a report for you below.` }]);
            } else if (effectiveMode === 'roadmap') {
                const res = await axios.post(`${API_BASE_URL}/ai/roadmap`,
                    { dreamJob: userInput },
                    { headers: { 'X-User-ID': user?.uid || user?._id } }
                );
                setResult(res.data);
                setMessages(prev => [...prev, { role: 'bot', content: `I've crafted a personalized 6-month roadmap for you to become a ${res.data.dreamJob}. Check it out!` }]);
                setMode('menu');
            }
        } catch (err) {
            const status = err.response?.status;
            let message = "Sorry, something went wrong. Please try again.";
            if (status === 429) message = "Please wait about 30 seconds before trying again — rate limit reached.";
            else if (status === 500) message = "The AI service encountered an error. Please try again in a moment.";
            else if (!err.response) message = "Can't reach the server. Please check your connection.";
            setMessages(prev => [...prev, { role: 'bot', content: message }]);
        } finally {
            setLoading(false);
        }
    };



    const handleCareerInsights = async () => {
        setLoading(true);
        setMessages(prev => [...prev, { role: 'bot', content: "Analyzing your applications and generating career insights..." }]);
        try {
            const res = await axios.post(`${API_BASE_URL}/ai/career-advice`, {},
                { headers: { 'X-User-ID': user?.uid || user?._id } }
            );
            setCareerAdvice(res.data);
            setResult(null);
            setMessages(prev => [...prev, { role: 'bot', content: `I've analyzed your ${res.data.applicationStats?.total || 0} applications and prepared personalized insights.` }]);
        } catch (err) {
            console.error('Career Advice Error:', err);
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I couldn't fetch your career insights. Make sure you have applications saved in your tracker." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">
            <header className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <Bot className="h-3 w-3" /> AI Career Coach
                </div>
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Career Architect</h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">Get roadmaps, eligibility checks, and personalized career advice.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Chat Panel */}
                <div className="lg:col-span-4 h-[700px] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI Bot</h3>
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setMode('menu'); setResult(null); setMessages([{ role: 'bot', content: `Hey ${user?.name?.split(' ')[0] || 'there'}! How can I help you today?` }]); }}
                            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                            title="Reset"
                        >
                            <Zap className="h-4 w-4 text-stone-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${msg.role === 'bot'
                                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-tl-sm'
                                    : 'bg-primary text-white rounded-tr-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-stone-100 dark:bg-stone-800 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1.5 items-center">
                                    <div className="h-1.5 w-1.5 bg-stone-400 rounded-full animate-bounce" />
                                    <div className="h-1.5 w-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="h-1.5 w-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-3 bg-white dark:bg-stone-900">
                        {mode === 'menu' && (
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => { setMode('analyze'); setMessages(p => [...p, { role: 'bot', content: "Please paste the job description you'd like me to analyze." }]); }}
                                    className="p-3 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg flex flex-col items-center gap-1.5 transition-colors text-center"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs text-stone-600 dark:text-stone-400">Eligibility</span>
                                </button>
                                <button
                                    onClick={() => { setMode('roadmap'); setMessages(p => [...p, { role: 'bot', content: "What's your target role? I'll build a roadmap for you." }]); }}
                                    className="p-3 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg flex flex-col items-center gap-1.5 transition-colors text-center"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs text-stone-600 dark:text-stone-400">Roadmap</span>
                                </button>
                                <button
                                    onClick={() => { setCareerAdvice(null); handleCareerInsights(); }}
                                    className="p-3 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg flex flex-col items-center gap-1.5 transition-colors text-center"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                                        <Lightbulb className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs text-stone-600 dark:text-stone-400">Insights</span>
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={mode === 'analyze' ? 'Paste JD here…' : mode === 'roadmap' ? 'Target job title…' : 'Ask me anything…'}
                                className="flex-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-stone-400"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() || loading}
                                className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition-colors disabled:opacity-50 shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Display Panel */}
                <div className="lg:col-span-8 min-h-[700px] relative">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                            >
                                <div className="h-12 w-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Analyzing…</h3>
                                <p className="text-sm text-stone-500 mt-1">Building your personalized results.</p>
                            </motion.div>
                        ) : careerAdvice ? (
                            /* Career Insights */
                            <motion.div key="career-insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">Career Insights</h2>
                                            <p className="text-sm text-stone-600 dark:text-stone-400">{careerAdvice.overallAssessment}</p>
                                        </div>
                                    </div>

                                    {careerAdvice.applicationStats && (
                                        <div className="mt-5 grid grid-cols-4 gap-3">
                                            {[
                                                { label: 'Total', value: careerAdvice.applicationStats.total, color: 'text-stone-600' },
                                                { label: 'Applied', value: careerAdvice.applicationStats.applied, color: 'text-blue-600' },
                                                { label: 'Interviews', value: careerAdvice.applicationStats.interview, color: 'text-amber-600' },
                                                { label: 'Offers', value: careerAdvice.applicationStats.offer, color: 'text-emerald-600' }
                                            ].map((stat, i) => (
                                                <div key={i} className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                                                    <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Your Strengths
                                        </h3>
                                        <div className="space-y-2">
                                            {careerAdvice.strengths?.map((strength, i) => (
                                                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg">
                                                    <span className="h-5 w-5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                                                    <span className="text-sm text-stone-700 dark:text-stone-300">{strength}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4" /> Areas to Improve
                                        </h3>
                                        <div className="space-y-2">
                                            {careerAdvice.areasToImprove?.map((area, i) => (
                                                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg">
                                                    <span className="h-5 w-5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                                                    <span className="text-sm text-stone-700 dark:text-stone-300">{area}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {careerAdvice.strategicAdvice && careerAdvice.strategicAdvice.length > 0 && (
                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-indigo-600" /> Strategic Advice
                                        </h3>
                                        <div className="space-y-3">
                                            {careerAdvice.strategicAdvice.map((advice, i) => (
                                                <div key={i} className={`p-4 rounded-lg border-l-3 ${advice.priority === 'high' ? 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-900/10' :
                                                    advice.priority === 'medium' ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10' :
                                                        'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                                    }`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">{advice.title}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${advice.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                                                            advice.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>{advice.priority}</span>
                                                    </div>
                                                    <p className="text-xs text-stone-600 dark:text-stone-400">{advice.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {careerAdvice.roleRecommendations && careerAdvice.roleRecommendations.length > 0 && (
                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                                            <Award className="h-4 w-4 text-purple-600" /> Recommended Roles
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {careerAdvice.roleRecommendations.map((role, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium border border-purple-100 dark:border-purple-800/50">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {careerAdvice.nextSteps && careerAdvice.nextSteps.length > 0 && (
                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4 text-blue-600" /> Next Steps
                                        </h3>
                                        <div className="space-y-2">
                                            {careerAdvice.nextSteps.map((step, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                                                    <span className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                                                    <span className="text-sm text-stone-700 dark:text-stone-300">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {careerAdvice.motivationalMessage && (
                                    <div className="bg-stone-900 dark:bg-stone-800 rounded-xl p-6 text-white">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-sm italic leading-relaxed text-stone-300">{careerAdvice.motivationalMessage}</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : !result ? (
                            /* Idle State */
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-700 rounded-xl"
                            >
                                <div className="h-16 w-16 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center justify-center mb-5">
                                    <Sparkles className="h-7 w-7 text-stone-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">Ready when you are</h3>
                                <p className="text-sm text-stone-500 max-w-sm">
                                    Paste a job description to check eligibility, type a career goal for a roadmap, or just ask me anything.
                                </p>
                            </motion.div>
                        ) : result.phases ? (
                            /* Roadmap Result */
                            <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-primary font-medium mb-1">Career Roadmap</p>
                                            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{result.dreamJob}</h2>
                                        </div>
                                        <p className="text-sm text-stone-500">6-month plan</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {result.phases.map((phase, i) => (
                                        <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-xs text-primary font-medium">{phase.month}</span>
                                                    <h4 className="text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5">{phase.topics[0]}</h4>
                                                </div>
                                                <div className="h-8 w-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs text-stone-500 font-medium shrink-0">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                {phase.actionItems.map((item, j) => (
                                                    <div key={j} className="flex items-start gap-2.5 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <span className="text-sm text-stone-600 dark:text-stone-300 leading-snug">{item}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* YouTube Links */}
                                            <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                                                <p className="text-xs text-stone-400 mb-2">Recommended</p>
                                                <div className="flex flex-col gap-1.5">
                                                    {phase.topics?.slice(0, 2).map((topic, idx) => {
                                                        const playlist = getYouTubePlaylistForSkill(topic);
                                                        return (
                                                            <a
                                                                key={idx}
                                                                href={playlist.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                                            >
                                                                <Youtube className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{playlist.name}</span>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Resources */}
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                    <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-stone-400" /> Resources
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {result.recommendedResources && result.recommendedResources.map((res, i) => {
                                            const resourceName = typeof res === 'string' ? res : res.name;
                                            const resourceUrl = typeof res === 'string' ? null : res.url;
                                            return (
                                                <a
                                                    key={i}
                                                    href={resourceUrl || '#'}
                                                    target={resourceUrl ? "_blank" : undefined}
                                                    rel={resourceUrl ? "noopener noreferrer" : undefined}
                                                    className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-100 dark:border-stone-700 hover:border-primary/30 transition-colors group"
                                                >
                                                    <h5 className="text-sm font-medium text-stone-700 dark:text-stone-300 group-hover:text-primary transition-colors leading-snug">
                                                        {resourceName}
                                                    </h5>
                                                    {resourceUrl && (
                                                        <p className="text-xs text-stone-400 mt-1.5 truncate">
                                                            {new URL(resourceUrl).hostname.replace('www.', '')}
                                                        </p>
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>


                            </motion.div>
                        ) : (
                            /* Eligibility Result */
                            <motion.div key="eligibility" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8">
                                    <div className="flex flex-col xl:flex-row items-center gap-8">
                                        <div className="relative h-36 w-36 flex items-center justify-center shrink-0">
                                            <svg className="h-full w-full transform -rotate-90">
                                                <circle cx="72" cy="72" r="60" className="stroke-stone-100 dark:stroke-stone-800 fill-none" strokeWidth="10" />
                                                <motion.circle
                                                    initial={{ strokeDashoffset: 377 }}
                                                    animate={{ strokeDashoffset: 377 - (377 * result.matchPercentage) / 100 }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    cx="72" cy="72" r="60"
                                                    className={`fill-none ${result.matchPercentage > 80 ? 'stroke-emerald-500' : result.matchPercentage > 50 ? 'stroke-primary' : 'stroke-rose-500'}`}
                                                    strokeWidth="10" strokeDasharray={377} strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute text-center">
                                                <span className="text-3xl font-semibold text-stone-900 dark:text-stone-100">{result.matchPercentage}%</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 text-center xl:text-left space-y-3">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${result.isEligible
                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                                                }`}>
                                                {result.isEligible ? 'Good fit — ready to apply' : 'Skill gaps detected'}
                                            </span>
                                            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{result.title}</h2>
                                            <div className="flex items-center justify-center xl:justify-start gap-2 text-sm text-stone-500">
                                                <span className="text-primary">{result.company}</span>
                                                <span>·</span>
                                                <span>{result.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {result.advice && (
                                        <div className="mt-6 p-4 bg-stone-900 dark:bg-stone-800 rounded-lg text-white">
                                            <div className="flex items-start gap-3">
                                                <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                                <p className="text-sm leading-relaxed text-stone-300">{result.advice}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h4 className="text-sm font-semibold text-rose-600 mb-4 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4" /> Missing Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.missingSkills.length > 0 ? result.missingSkills.map((s, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-md text-xs">
                                                    {s}
                                                </span>
                                            )) : <span className="text-sm text-stone-500 italic">You have all required skills</span>}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                                        <h4 className="text-sm font-semibold text-emerald-600 mb-4 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" /> Matched Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.matchedSkills.length > 0 ? result.matchedSkills.map((s, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md text-xs">
                                                    {s}
                                                </span>
                                            )) : <span className="text-sm text-stone-500 italic">No direct matches found.</span>}
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
