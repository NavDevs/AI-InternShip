import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Briefcase, Plus } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { INDIAN_STATES } from '../constants/states';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        skills: '',
        state: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const userData = {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                skills: skillsArray,
                profile: {
                    state: formData.state
                },
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', user.uid), userData);

            login(userData);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden"
            >
                {/* Colored top accent */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-blue-400 to-indigo-500" />
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                            Create your account
                        </h2>
                        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
                            Join thousands of students tracking their success
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Skills</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 pl-10 pr-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    placeholder="React, Node, SQL (comma separated)"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">I am a</label>
                                <select
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 px-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin / Recruiter</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">State</label>
                                <select
                                    required
                                    className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-2.5 px-3 text-sm text-stone-900 dark:text-stone-100 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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

                        {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account…' : (
                                <>
                                    <Plus className="h-4 w-4" /> Sign up
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
