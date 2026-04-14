import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    role: 'student',
                    createdAt: new Date().toISOString()
                });
            }
            navigate('/');
        } catch (err) {
            setError('Google sign-in failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center py-12 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-md bg-chassis rounded-2xl overflow-hidden shadow-[12px_12px_24px_#a8b4c4,-12px_-12px_24px_#ffffff]"
            >
                {/* Safety orange LED strip */}
                <div className="h-1.5 bg-accent-primary shadow-[0_0_10px_2px_rgba(255,71,87,0.6)]" />
                
                <div className="p-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-chassis shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff,inset_1px_1px_0_#ffffff] mb-4">
                            <LogIn className="h-7 w-7 text-accent-primary" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-text-primary drop-shadow-[0_1px_1px_#ffffff]">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-text-muted">
                            Track your journey to your dream career
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full bg-recessed rounded-lg py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-xs font-mono font-bold uppercase tracking-widest text-text-muted mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    className="w-full bg-recessed rounded-lg py-3 pl-11 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[inset_6px_6px_12px_#a8b4c4,inset_-6px_-6px_12px_#ffffff] shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 font-mono"
                                    placeholder="Your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && <p className="text-center text-sm font-mono text-accent-primary">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-accent-primary text-white py-3.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in…' : (
                                <>
                                    <LogIn className="h-4 w-4" /> Sign in
                                </>
                            )}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-shadow-dark to-transparent opacity-30"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-chassis px-4 text-text-muted font-mono font-bold uppercase tracking-widest">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="flex w-full items-center justify-center gap-3 bg-chassis text-text-primary py-3.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[4px_4px_8px_#a8b4c4,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b4c4,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#a8b4c4,inset_-4px_-4px_8px_#ffffff] active:translate-y-0.5 transition-all duration-200"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-muted mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-accent-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
