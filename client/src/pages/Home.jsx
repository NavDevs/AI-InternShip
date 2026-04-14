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
    },
    {
        icon: BarChart2,
        title: "Performance Insights",
        desc: "Visualize your application funnel and see where you stand in your job search journey.",
    },
    {
        icon: Smartphone,
        title: "Mobile Ready PWA",
        desc: "Install Intern-AI on your phone. It works like a native app with offline support.",
    },
    {
        icon: Zap,
        title: "Real-time Reminders",
        desc: "Never miss a follow-up. Set reminders and track your interview schedules seamlessly.",
    },
    {
        icon: ShieldCheck,
        title: "Secure & Fast",
        desc: "Your data is protected with industry-standard JWT encryption and hosted on MongoDB Atlas.",
    },
    {
        icon: Sparkles,
        title: "Smart Recommendations",
        desc: "Get suggestions on missing skills that could land you your next big offer.",
    },
];

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-24 pb-16">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center text-center pt-12 sm:pt-20 max-w-5xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-2 glass-panel rounded-full px-5 py-2 text-xs font-semibold text-brand-300 mb-8 border border-brand-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                    <Sparkles className="h-4 w-4 text-brand-400" /> AI-Powered Job Hunting
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.2 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none font-outfit"
                >
                    Your copilot for{' '}
                    <span className="text-gradient drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">internships & jobs</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed"
                >
                    Track applications, analyze job descriptions with AI, and get matched
                    with roles that fit your skills. All in one place.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4"
                >
                    {user ? (
                        <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-3.5 text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all duration-200 border border-brand-500">
                            Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-3.5 text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all duration-200 border border-brand-500">
                            Get Started Free <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                    <Link to="/jobs" className="inline-flex items-center justify-center gap-2 glass-panel text-white px-8 py-3.5 text-sm font-semibold rounded-lg hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200">
                        Browse Jobs
                    </Link>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 text-center"
                >
                    {[
                        { value: '10k+', label: 'jobs listed' },
                        { value: '3 min', label: 'avg. setup' },
                        { value: 'Free', label: 'forever' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-panel rounded-2xl px-2 py-4 sm:px-6">
                            <p className="text-3xl sm:text-4xl font-bold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] font-outfit">{stat.value}</p>
                            <p className="text-xs font-semibold text-brand-300 uppercase tracking-widest mt-2">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-outfit drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">Everything you need to succeed</h2>
                    <p className="mt-4 text-text-secondary max-w-xl mx-auto text-base sm:text-lg">Built with the latest AI technology to give you an edge.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="glass-card rounded-2xl p-6 lg:p-8 group"
                        >
                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-6 group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 font-outfit">{feature.title}</h3>
                            <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="glass-card rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center text-white relative overflow-hidden border border-brand-500/30">
                    {/* Glowing background blob in CTA */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-900/50 via-brand-600/20 to-purple-900/50 z-0"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
                    
                    <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-outfit drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Ready to land your dream internship?</h2>
                        <p className="text-brand-100 text-lg sm:text-xl">Join thousands of students and start tracking your success today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            {user ? (
                                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 bg-white text-brand-900 px-8 py-4 text-sm font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300">
                                    Return to Dashboard <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-brand-900 px-8 py-4 text-sm font-bold uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300">
                                    Join Now — It's Free <ArrowRight className="h-5 w-5" />
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
