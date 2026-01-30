import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    Sparkles,
    Target,
    BarChart2,
    Smartphone,
    ArrowRight,
    ShieldCheck,
    Zap
} from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-24 pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center text-center pt-10 sm:pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-600 text-sm font-bold mb-8"
                >
                    <Sparkles className="h-4 w-4" /> The Future of Job Hunting is AI-Powered
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl"
                >
                    Your AI Copilot for <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Internships & Jobs</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium"
                >
                    Track applications, analyze job descriptions using AI, and get matched with roles that fit your skills perfectly. All in one place.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                    {user ? (
                        <Link to="/dashboard" className="flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 font-bold text-white shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all">
                            Go to Dashboard <ArrowRight className="h-5 w-5" />
                        </Link>
                    ) : (
                        <Link to="/register" className="flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 font-bold text-white shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all">
                            Get Started Free <ArrowRight className="h-5 w-5" />
                        </Link>
                    )}
                    <Link to="/jobs" className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-10 py-4 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Browse Jobs
                    </Link>
                </motion.div>

                {/* Decorative Background Blur */}
                <div className="absolute top-0 -z-10 h-full w-full pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-blue-200/30 blur-[120px] rounded-full" />
                    <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] bg-indigo-200/20 blur-[100px] rounded-full" />
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white">Everything you need to succeed</h2>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Built with the latest technology to give you an edge.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Target,
                            title: "AI Job Analysis",
                            desc: "Paste any JD and our AI extracts required skills, matching them against your profile instantly.",
                            color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        },
                        {
                            icon: BarChart2,
                            title: "Performance Insights",
                            desc: "Visualize your application funnel and see where you stand in your job search journey.",
                            color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        },
                        {
                            icon: Smartphone,
                            title: "Mobile Ready PWA",
                            desc: "Install Intern-AI on your phone. It works like a native app with offline support.",
                            color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        },
                        {
                            icon: Zap,
                            title: "Real-time Reminders",
                            desc: "Never miss a follow-up. Set reminders and track your interview schedules seamlessly.",
                            color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        },
                        {
                            icon: ShieldCheck,
                            title: "Secure & Fast",
                            desc: "Your data is protected with industry-standard JWT encryption and hosted on MongoDB Atlas.",
                            color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        },
                        {
                            icon: Sparkles,
                            title: "Smart Recommendations",
                            desc: "Get suggestions on missing skills that could land you your next big offer.",
                            color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="glass p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className={`h-14 w-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                                <feature.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4">
                <div className="bg-slate-900 rounded-[3rem] p-8 sm:p-20 text-center text-white relative overflow-hidden shadow-3xl">
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl sm:text-6xl font-bold tracking-tight">Ready to land your dream internship?</h2>
                        <p className="text-slate-400 text-lg font-medium">Join thousands of students and start tracking your success today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link to="/dashboard" className="bg-primary hover:bg-blue-600 px-10 py-4 rounded-2xl font-extrabold transition-all shadow-xl shadow-blue-500/20">
                                    Return to Dashboard
                                </Link>
                            ) : (
                                <Link to="/register" className="bg-primary hover:bg-blue-600 px-10 py-4 rounded-2xl font-extrabold transition-all shadow-xl shadow-blue-500/20">
                                    Join Now - It's Free
                                </Link>
                            )}
                            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-10 py-4 rounded-2xl font-extrabold transition-all border border-white/20">
                                Download Mobile App
                            </button>
                        </div>
                    </div>

                    {/* Animated background elements for CTA */}
                    <div className="absolute top-0 right-0 h-full w-full opacity-20 pointer-events-none">
                        <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-primary/40 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-secondary/30 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
