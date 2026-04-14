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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-lg bg-chassis rounded-2xl overflow-hidden shadow-[12px_12px_24px_#a8b4c4,-12px_-12px_24px_#ffffff]"
            >
                {/* Safety orange LED strip */}
                <div className="h-1.5 bg-accent-primary shadow-[0_0_10px_2px_rgba(255,71,87,0.6)]" />
                
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-chassis shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff,inset_1px_1px_0_#ffffff] mb-4">
                            <svg className="h-7 w-7 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-text-primary drop-shadow-[0_1px_1px_#ffffff]">
                            Create your account
                        </h2>
                        <p className="mt-2 text-text-muted">
                            Join thousands of students tracking their success
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-recessed rounded-lg py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-sm"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-recessed rounded-lg py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-sm"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-recessed rounded-lg py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-sm"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Skills</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                <input
                                    type="text"
                                    className="w-full bg-recessed rounded-lg py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-sm"
                                    placeholder="React, Node, SQL (comma separated)"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">I am a</label>
                                <select
                                    className="w-full bg-recessed rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-sm"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin / Recruiter</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">State</label>
                                <select
                                    required
                                    className="w-full bg-recessed rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono text-sm"
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

                        {error && <p className="text-center text-sm font-mono text-accent-primary">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-accent-primary text-white py-3.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account…' : (
                                <>
                                    <Plus className="h-4 w-4" /> Sign up
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-muted mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-accent-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
