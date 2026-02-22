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

const features = [
    {
        icon: Target,
        title: "AI Job Analysis",
        desc: "Paste any JD and our AI extracts required skills, matching them against your profile instantly.",
        accent: "bg-blue-500",
        tint: "bg-blue-50 dark:bg-blue-950/40",
        iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
        icon: BarChart2,
        title: "Performance Insights",
        desc: "Visualize your application funnel and see where you stand in your job search journey.",
        accent: "bg-indigo-500",
        tint: "bg-indigo-50 dark:bg-indigo-950/40",
        iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
        icon: Smartphone,
        title: "Mobile Ready PWA",
        desc: "Install Intern-AI on your phone. It works like a native app with offline support.",
        accent: "bg-violet-500",
        tint: "bg-violet-50 dark:bg-violet-950/40",
        iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
        icon: Zap,
        title: "Real-time Reminders",
        desc: "Never miss a follow-up. Set reminders and track your interview schedules seamlessly.",
        accent: "bg-amber-500",
        tint: "bg-amber-50 dark:bg-amber-950/40",
        iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Fast",
        desc: "Your data is protected with industry-standard JWT encryption and hosted on MongoDB Atlas.",
        accent: "bg-emerald-500",
        tint: "bg-emerald-50 dark:bg-emerald-950/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
        icon: Sparkles,
        title: "Smart Recommendations",
        desc: "Get suggestions on missing skills that could land you your next big offer.",
        accent: "bg-rose-500",
        tint: "bg-rose-50 dark:bg-rose-950/40",
        iconColor: "text-rose-600 dark:text-rose-400",
    },
];

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-24 pb-16">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center text-center pt-14 sm:pt-24 max-w-3xl mx-auto">
                {/* Subtle warm tint behind hero */}
                <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-50/60 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent -z-10 rounded-3xl" />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-primary text-sm font-medium mb-6"
                >
                    <Sparkles className="h-3.5 w-3.5" /> AI-Powered Job Hunting
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-tight"
                >
                    Your copilot for{' '}
                    <span className="text-primary">internships & jobs</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mt-5 text-lg text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed"
                >
                    Track applications, analyze job descriptions with AI, and get matched
                    with roles that fit your skills. All in one place.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3"
                >
                    {user ? (
                        <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors shadow-sm shadow-primary/30">
                            Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors shadow-sm shadow-primary/30">
                            Get Started Free <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                    <Link to="/jobs" className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-6 py-3 font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                        Browse Jobs
                    </Link>
                    <a
                        href="/Intern-AI-v6.apk"
                        download="Intern-AI-v6.apk"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-100 dark:bg-stone-800 px-6 py-3 font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-sm"
                    >
                        <Smartphone className="h-5 w-5 text-primary dark:text-primary-light" />
                        Download App
                    </a>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex items-center gap-8 text-center"
                >
                    {[
                        { value: '10k+', label: 'jobs listed' },
                        { value: '3 min', label: 'avg. setup time' },
                        { value: 'Free', label: 'forever' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100">Everything you need to succeed</h2>
                    <p className="mt-3 text-stone-500 dark:text-stone-400">Built with the latest technology to give you an edge.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="relative bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {/* Colored top accent bar */}
                            <div className={`absolute top-0 left-0 right-0 h-0.5 ${feature.accent}`} />
                            <div className={`h-10 w-10 ${feature.tint} rounded-lg flex items-center justify-center mb-4`}>
                                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                            </div>
                            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-2">{feature.title}</h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4">
                <div className="relative rounded-2xl overflow-hidden bg-[#1e3a5f] dark:bg-[#0f1f35] px-8 py-14 sm:px-16 sm:py-20 text-center text-white">
                    {/* Subtle corner decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative max-w-xl mx-auto space-y-5">
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready to land your dream internship?</h2>
                        <p className="text-blue-200/80 text-base">Join thousands of students and start tracking your success today.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            {user ? (
                                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-accent/20">
                                    Return to Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-accent/20">
                                    Join Now — It's Free <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
