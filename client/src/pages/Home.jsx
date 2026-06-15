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
                {/* Floating 3D Orb Graphic */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-bitcoin-orange to-digital-gold opacity-20 blur-3xl animate-float"></div>
                        <div className="absolute inset-4 rounded-full border-2 border-bitcoin-orange/30 animate-spin-slow"></div>
                        <div className="absolute inset-8 rounded-full border border-digital-gold/50 animate-spin-reverse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-bitcoin-orange to-burnt-orange rounded-full shadow-[0_0_40px_rgba(247,147,26,0.6)]"></div>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 text-xs font-semibold font-mono text-bitcoin-orange mb-8 border border-bitcoin-orange/30 glow-orange"
                >
                    <Sparkles className="h-4 w-4 text-bitcoin-orange" /> AI-POWERED JOB HUNTING
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.2 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight font-heading relative z-10"
                >
                    Your copilot for{' '}
                    <span className="text-gradient drop-shadow-[0_0_25px_rgba(247,147,26,0.6)]">internships & jobs</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="mt-6 text-base sm:text-lg font-body text-text-muted max-w-2xl leading-relaxed relative z-10"
                >
                    Track applications, analyze job descriptions with AI, and get matched
                    with roles that fit your skills. All in one place.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 relative z-10"
                >
                    {user ? (
                        <Link to="/dashboard" className="btn-primary">
                            Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <Link to="/register" className="btn-primary">
                            Get Started Free <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                    <Link to="/jobs" className="btn-outline">
                        Browse Jobs
                    </Link>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 text-center relative z-10"
                >
                    {[
                        { value: '10k+', label: 'jobs listed' },
                        { value: '3 min', label: 'avg. setup' },
                        { value: 'Free', label: 'forever' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                            className="card-standard animate-bounce"
                            style={{ animationDelay: `${i * 0.5}s` }}
                        >
                            <p className="text-3xl sm:text-4xl font-bold font-heading text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">{stat.value}</p>
                            <p className="text-xs font-mono text-bitcoin-orange uppercase tracking-widest mt-2">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-heading text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">Everything you need to succeed</h2>
                    <p className="mt-4 font-body text-text-muted max-w-xl mx-auto text-base sm:text-lg">Built with the latest AI technology to give you an edge.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="card-standard group relative overflow-hidden"
                        >
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-bitcoin-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-bitcoin-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-bitcoin-orange/10 border border-bitcoin-orange/20 text-bitcoin-orange mb-6 group-hover:bg-bitcoin-orange group-hover:text-white glow-orange transition-all duration-300">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold font-heading text-white mb-3">{feature.title}</h3>
                            <p className="font-body text-text-muted leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="card-glass rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center text-white relative overflow-hidden border border-bitcoin-orange/30">
                    {/* Glowing background effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-bg-void via-bitcoin-orange/10 to-bg-void z-0"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-bitcoin-orange rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-digital-gold rounded-full mix-blend-screen filter blur-[80px] opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>

                    <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-heading drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Ready to land your dream internship?</h2>
                        <p className="font-body text-bitcoin-orange text-lg sm:text-xl">Join thousands of students and start tracking your success today.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                            {user ? (
                                <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 bg-white text-bg-void px-8 py-4 text-sm font-bold uppercase font-mono tracking-wider rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300">
                                    Return to Dashboard <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-bg-void px-8 py-4 text-sm font-bold uppercase font-mono tracking-wider rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300">
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
