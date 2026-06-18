import React, { useState, useEffect, useRef } from 'react';
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
    Loader2,
    Upload,
    FileText,
    Sparkles,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIAN_STATES } from '../constants/states';
import api from '../utils/api';

const Profile = () => {
    const { user } = useAuth();
    const fileInputRef = useRef(null);

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

    // Resume extraction state
    const [resumeFile, setResumeFile] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState(null);
    const [extractError, setExtractError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

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
            await setDoc(userRef, {
                name: formData.name,
                skills,
                role: formData.role,
                profile: { state: formData.state },
                education: { college: formData.college, degree: formData.degree }
            }, { merge: true });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    // --- Resume Extraction Logic ---
    const extractTextFromPDF = async (file) => {
        const pdfjsLib = await import('pdfjs-dist');
        // Use the worker bundled with the npm package via Vite's ?url import
        // This avoids CDN version mismatches entirely
        const { default: workerSrc } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim();
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setExtractError('Please upload a PDF file only.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setExtractError('File size must be under 5MB.');
            return;
        }
        setResumeFile(file);
        setExtractedData(null);
        setExtractError('');
    };

    const handleExtract = async () => {
        if (!resumeFile) return;
        setIsExtracting(true);
        setExtractError('');
        setExtractedData(null);

        try {
            const resumeText = await extractTextFromPDF(resumeFile);

            if (!resumeText || resumeText.length < 50) {
                throw new Error('Could not read text from this PDF. It may be image-based or scanned. Please try a text-based PDF.');
            }

            const res = await api.post('/ai/extract-resume',
                { resumeText },
                { headers: { 'X-User-ID': user?.uid } }
            );

            setExtractedData(res.data);
        } catch (err) {
            setExtractError(err.response?.data?.message || err.message || 'Extraction failed. Please try again.');
        } finally {
            setIsExtracting(false);
        }
    };

    const applyExtractedData = () => {
        if (!extractedData) return;

        // Merge extracted skills with existing ones (no duplicates)
        const mergedSkills = [...new Set([...skills, ...(extractedData.skills || [])])];

        setFormData(prev => ({
            ...prev,
            name: extractedData.name || prev.name,
            college: extractedData.college || prev.college,
            degree: extractedData.degree || prev.degree,
            state: extractedData.state || prev.state,
            role: extractedData.role || prev.role,
        }));
        setSkills(mergedSkills);
        setExtractedData(null);
        setResumeFile(null);
        setMessage('Resume data applied! Review and click "Save changes".');
        setTimeout(() => setMessage(''), 4000);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-16">
            {/* Profile Header */}
            <header className="bg-stone-900 dark:bg-stone-800 rounded-xl px-6 py-10 text-white">
                <div className="flex flex-col items-center gap-5 md:flex-row md:gap-8">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-stone-700 shrink-0">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
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
                                <Shield className="h-3 w-3 text-emerald-400" /> Member since {user?.metadata?.creationTime ? new Date(user?.metadata?.creationTime).getFullYear() : new Date().getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== RESUME UPLOAD SECTION ===== */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">AI Resume Parser</h2>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Upload your resume and let AI auto-fill your profile</p>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !resumeFile && fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer
                        ${isDragOver
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : resumeFile
                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 cursor-default'
                                : 'border-stone-300 dark:border-stone-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                    />

                    {resumeFile ? (
                        <>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{resumeFile.name}</p>
                                <p className="text-xs text-stone-500 mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB · PDF</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setResumeFile(null); setExtractedData(null); setExtractError(''); }}
                                className="absolute top-3 right-3 p-1 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                            >
                                <X className="h-4 w-4 text-stone-500" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Drop your resume here or <span className="text-blue-600 dark:text-blue-400">browse</span></p>
                                <p className="text-xs text-stone-400 mt-0.5">PDF only · Max 5MB</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Error */}
                <AnimatePresence>
                    {extractError && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-3 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{extractError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Extract Button */}
                {resumeFile && !extractedData && (
                    <motion.button
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        type="button"
                        onClick={handleExtract}
                        disabled={isExtracting}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {isExtracting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Extracting with AI…</>
                        ) : (
                            <><Sparkles className="h-4 w-4" /> Extract Profile from Resume</>
                        )}
                    </motion.button>
                )}

                {/* Extracted Data Preview */}
                <AnimatePresence>
                    {extractedData && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-stone-900 p-5 space-y-4"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">AI found the following in your resume</h3>
                            </div>

                            {extractedData.summary && (
                                <p className="text-xs text-stone-500 dark:text-stone-400 italic border-l-2 border-blue-300 pl-3">{extractedData.summary}</p>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {extractedData.name && <div><span className="text-xs text-stone-400 block">Name</span><span className="font-medium text-stone-800 dark:text-stone-200">{extractedData.name}</span></div>}
                                {extractedData.college && <div><span className="text-xs text-stone-400 block">College</span><span className="font-medium text-stone-800 dark:text-stone-200">{extractedData.college}</span></div>}
                                {extractedData.degree && <div><span className="text-xs text-stone-400 block">Degree</span><span className="font-medium text-stone-800 dark:text-stone-200">{extractedData.degree}</span></div>}
                                {extractedData.state && <div><span className="text-xs text-stone-400 block">State</span><span className="font-medium text-stone-800 dark:text-stone-200">{extractedData.state}</span></div>}
                            </div>

                            {extractedData.skills?.length > 0 && (
                                <div>
                                    <span className="text-xs text-stone-400 block mb-2">Skills extracted ({extractedData.skills.length})</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {extractedData.skills.map(skill => (
                                            <span key={skill} className="rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setExtractedData(null); setResumeFile(null); }}
                                    className="flex-1 rounded-lg border border-stone-200 dark:border-stone-700 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="button"
                                    onClick={applyExtractedData}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" /> Apply to Profile
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save changes</>}
                        </button>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${message.includes('success') || message.includes('applied')
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}
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
