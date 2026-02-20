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
        <div className="mx-auto max-w-4xl space-y-8 pb-16">
            {/* Profile Header */}
            <header className="bg-stone-900 dark:bg-stone-800 rounded-xl px-6 py-10 text-white">
                <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-stone-700 shrink-0">
                        {profilePic ? (
                            <img
                                src={profilePic}
                                alt="Profile"
                                onError={() => {
                                    console.warn('Profile image failed to load, falling back to initials');
                                    setProfilePic(null);
                                }}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-stone-800 text-2xl font-semibold">
                                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-semibold">{formData.name || 'Your Name'}</h1>
                        <p className="mt-1 text-stone-400">{user?.role || 'Student'} · {user?.email}</p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                            <span className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs">
                                <Shield className="h-3 w-3 text-emerald-400" /> Member since {new Date(user?.metadata?.creationTime).getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-100">
                            <UserIcon className="h-4 w-4 text-primary" /> Personal Information
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5">Account Role</label>
                                <select
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="employed">Employed</option>
                                    <option value="unemployed">Unemployed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5">State</label>
                                <select
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                >
                                    <option value="">Select your state</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-100">
                            <GraduationCap className="h-4 w-4 text-indigo-600" /> Education
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5">College / University</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.college}
                                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1.5">Degree / Major</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3.5 py-2.5 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={formData.degree}
                                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Skills */}
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
                        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-100">
                            <Briefcase className="h-4 w-4 text-amber-600" /> Skills
                        </h2>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {skills.map((skill) => (
                                        <motion.span
                                            key={skill}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center gap-1 rounded-md bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-300"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Add a skill…"
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-3 pr-10 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="space-y-3">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Save changes
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${message.includes('success')
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                        }`}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
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
