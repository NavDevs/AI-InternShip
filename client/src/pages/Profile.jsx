import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    User as UserIcon,
    Mail,
    Briefcase,
    GraduationCap,
    Save,
    CheckCircle2,
    Plus,
    X,
    Shield,
    Loader2
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIAN_STATES } from '../constants/states';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        college: user?.education?.college || '',
        degree: user?.education?.degree || '',
        state: user?.profile?.state || '',
        role: user?.role || 'student',
    });
    const [skills, setSkills] = useState(user?.skills || []);
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [profilePic, setProfilePic] = useState(user?.photoURL || null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                college: user.education?.college || '',
                degree: user.education?.degree || '',
                state: user.profile?.state || '',
                role: user.role || 'student',
            });
            setSkills(user.skills || []);
            if (user.photoURL) {
                setProfilePic(user.photoURL);
            }
        }
    }, [user]);


    const handleAddSkill = (e) => {
        e.preventDefault();
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                name: formData.name,
                skills: skills,
                role: formData.role,
                profile: {
                    state: formData.state
                },
                education: {
                    college: formData.college,
                    degree: formData.degree
                }
            });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl space-y-10 pb-20">
            {/* Profile Hero */}
            <header className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-8 py-16 text-white shadow-3xl dark:bg-slate-900/50">
                <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:gap-10">
                    <div className="group relative">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-2xl transition-transform hover:scale-105 overflow-hidden">
                            {profilePic ? (
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    onError={() => {
                                        console.warn('Profile image failed to load, falling back to initials');
                                        setProfilePic(null);
                                    }}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-4xl font-black">
                                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-black tracking-tight">{formData.name || 'Your Name'}</h1>
                        <p className="mt-2 text-xl font-bold text-slate-400">{user?.role || 'Student'} • {user?.email}</p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                            <span className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase backdrop-blur-md">
                                <Shield className="h-3 w-3 text-emerald-400" /> Member since {new Date(user?.metadata?.creationTime).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Animated Background Polish */}
                <div className="absolute top-0 right-0 h-full w-full pointer-events-none opacity-30">
                    <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-primary/40 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 h-[300px] w-[300px] bg-secondary/30 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
                </div>
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Info Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-[2rem] p-8 shadow-sm">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
                            <UserIcon className="h-6 w-6 text-primary" /> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-black uppercase text-slate-400">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-900 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-black uppercase text-slate-400">Account Role</label>
                                <select
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-900 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="recruiter">Recruiter</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-black uppercase text-slate-400">Selected State (Location-Based Discovery)</label>
                                <select
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-900 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                >
                                    <option value="">-- Select Your State --</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Education Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-[2rem] p-8 shadow-sm">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
                            <GraduationCap className="h-6 w-6 text-secondary" /> Education
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-black uppercase text-slate-400">College / University</label>
                                <input
                                    type="text"
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-900 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={formData.college}
                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 text-xs font-black uppercase text-slate-400">Degree / Major</label>
                                <input
                                    type="text"
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 px-5 py-3 font-bold text-slate-900 transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={formData.degree}
                                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-8">
                    {/* Skills Card */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-[2rem] p-8 shadow-sm">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white">
                            <Briefcase className="h-6 w-6 text-amber-500" /> Skills
                        </h2>

                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {skills.map((skill) => (
                                        <motion.span
                                            key={skill}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Add a skill..."
                                    className="w-full rounded-2xl border-slate-200 bg-slate-50 py-3 pl-4 pr-12 font-bold text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-blue-500/20 active:scale-90"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Save Button & Feedback */}
                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-[2rem] bg-slate-900 py-6 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 dark:bg-primary"
                        >
                            {isSaving ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Save className="h-6 w-6" /> SAVE PROFILE
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex items-center gap-2 rounded-2xl p-4 text-sm font-black shadow-lg ${message.includes('success')
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </form>


        </div>
    );
};

export default Profile;
