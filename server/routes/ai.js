const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');
const mongoose = require('mongoose');
const { getResourcesForRole } = require('../utils/learningResources');
const { getQuestionsByRound } = require('../utils/interviewQuestions');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Model to use - Llama 3.3 70B is fast and capable
const MODEL = 'llama-3.3-70b-versatile';

const extractJson = (text) => {
    try {
        // Find the first { and last } to extract JSON block
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('No JSON block found');
        const jsonStr = text.substring(start, end + 1);
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('--- JSON Extraction Failure ---');
        console.error('Raw Response:', text);
        throw new Error('Failed to parse AI response: ' + e.message);
    }
};

// Helper function to call Groq
const callGroq = async (systemPrompt, userPrompt, jsonMode = false) => {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    const completion = await groq.chat.completions.create({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        response_format: jsonMode ? { type: 'json_object' } : undefined
    });

    return completion.choices[0]?.message?.content || '';
};

// AI Job Description Analyzer (Eligibility Check)
router.post('/analyze', auth, async (req, res) => {
    try {
        const { jdText } = req.body;
        console.log('Starting Groq Analysis for user:', req.user.id);

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            console.error('GROQ_API_KEY is not configured correctly in .env');
            return res.status(500).json({ message: 'AI Service configuration error. Please set GROQ_API_KEY in .env' });
        }

        if (!jdText) return res.status(400).json({ message: 'JD text is required' });

        let user = null;
        if (mongoose.Types.ObjectId.isValid(req.user.id)) {
            user = await User.findById(req.user.id);
        }
        if (!user && req.user.id) {
            user = await User.findOne({ uid: req.user.id });
        }

        let userSkills = ['React', 'JavaScript', 'Node.js', 'Web Technologies'];
        if (user && Array.isArray(user.skills) && user.skills.length > 0) {
            userSkills = user.skills;
        }

        const userProfile = {
            name: user?.name || 'Guest User',
            skills: userSkills,
            experience: user?.experience || [],
            projects: user?.projects || []
        };

        const systemPrompt = `You are an expert career advisor. Analyze job descriptions and compare them against candidate profiles. Always respond with valid JSON only.`;

        const userPrompt = `
Analyze the following job description and compare it against the user's profile.

USER PROFILE:
${JSON.stringify(userProfile)}

JOB DESCRIPTION:
${jdText}

Respond with this exact JSON structure:
{
    "title": "Job Title from JD",
    "company": "Company Name from JD",
    "location": "Location from JD",
    "matchPercentage": 75,
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"],
    "isEligible": true,
    "advice": "Short professional advice for the candidate"
}`;

        const response = await callGroq(systemPrompt, userPrompt, true);
        console.log('Groq Raw Response (Analyze):', response);

        let analysis;
        try {
            analysis = JSON.parse(response);
        } catch (e) {
            analysis = extractJson(response);
        }

        res.json(analysis);

    } catch (err) {
        console.error('Groq Analysis Error:', err);
        res.status(500).json({ message: 'AI Analysis error', error: err.message });
    }
});

// AI Job Eligibility Checker - Compares user skills with job requirements
router.post('/eligibility', auth, async (req, res) => {
    try {
        const { job, userSkills } = req.body;
        console.log('Checking eligibility for user:', req.user.id, 'Job:', job?.title);

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: 'AI Service configuration error' });
        }

        if (!job || !job.title) {
            return res.status(400).json({ message: 'Job details are required' });
        }

        const systemPrompt = `You are a career advisor AI that analyzes job requirements and candidate qualifications.
You must respond ONLY with valid JSON, no other text.`;

        const userPrompt = `Analyze if this candidate is eligible for the job position.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company || 'Not specified'}
- Description: ${job.description || 'Not provided'}
- Location: ${job.location || 'Not specified'}

CANDIDATE'S CURRENT SKILLS:
${userSkills && userSkills.length > 0 ? userSkills.join(', ') : 'No skills listed'}

Respond with this exact JSON structure:
{
    "eligibilityScore": 75,
    "isEligible": true,
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill1", "skill2"],
    "requiredSkills": ["all skills needed for this job"],
    "summary": "Brief eligibility analysis",
    "interviewQuestions": [
        {
            "question": "Previously asked interview question",
            "category": "Technical/Behavioral/HR",
            "difficulty": "Easy/Medium/Hard",
            "tips": "How to answer this question"
        }
    ],
    "roadmap": {
        "title": "Path to becoming eligible",
        "duration": "X weeks/months",
        "steps": [
            {
                "phase": "Phase 1: Foundation",
                "skills": ["skill to learn"],
                "tasks": ["specific task to do"],
                "youtubePlaylist": {"name": "Playlist Name", "url": "https://youtube.com/playlist?list=..."},
                "resources": [
                    {"name": "Resource Name", "url": "https://actual-url.com"}
                ],
                "certifications": [
                    {"name": "Certification Name", "provider": "Google/AWS/etc", "url": "https://...", "isFree": true}
                ]
            }
        ]
    }
}

IMPORTANT:
- eligibilityScore: 0-100 based on skill match
- isEligible: true if score >= 70
- If candidate has NO skills listed, set eligibilityScore to 10 and provide comprehensive roadmap
- interviewQuestions: ALWAYS include 5-8 commonly asked interview questions for this company and role. Include a mix of technical, behavioral, and HR questions. These should be realistic questions that ${job.company || 'companies in this industry'} typically ask.
- roadmap: ALWAYS include a roadmap, even if the user is eligible. It helps them improve further.
- For EACH phase, include:
  * phase: Clear phase name
  * skills: Array of skills to learn
  * tasks: Array of specific tasks to do
  * certifications: At least one free AND one paid certification from providers like Google, AWS, Microsoft, Coursera, Udemy, LinkedIn Learning
  
CRITICAL: ONLY provide real, working URLs. If you don't know the exact URL, DO NOT hallucinate one. Instead, leave the URL field as an empty string "" and the system will generate a search link for the user. NEVER use placeholder text like "https://example.com" or "actual-url.com".`;

        const response = await callGroq(systemPrompt, userPrompt, true);
        console.log('Groq Raw Response (Eligibility):', response);

        let result;
        try {
            result = JSON.parse(response);
        } catch (e) {
            result = extractJson(response);
        }

        // --- Post-processing and Sanitation ---
        const { sanitizeLink, getResourcesForRole } = require('../utils/learningResources');

        // 1. Sanitize AI-generated links
        if (result.roadmap && result.roadmap.steps) {
            result.roadmap.steps.forEach(step => {
                if (step.youtubePlaylist) {
                    step.youtubePlaylist = sanitizeLink(step.youtubePlaylist, 'youtube');
                }
                if (step.resources) {
                    step.resources = step.resources.map(r => sanitizeLink(r, 'resource'));
                }
                if (step.certifications) {
                    step.certifications = step.certifications.map(c => sanitizeLink(c, 'certification'));
                }
            });
        }

        // 2. Inject curated resources based on the job title if the roadmap seems thin or as a supplement
        const curated = getResourcesForRole(job.title);
        if (result.roadmap) {
            // Add a "Verified Resources" section to the roadmap or first phase if it makes sense
            if (result.roadmap.steps && result.roadmap.steps.length > 0) {
                const firstStep = result.roadmap.steps[0];

                // Supplement certifications if they are missing or placeholders
                if (!firstStep.certifications || firstStep.certifications.length < 2) {
                    const curatedCerts = curated.certifications || [];
                    firstStep.certifications = [...(firstStep.certifications || []), ...curatedCerts.slice(0, 2)];
                }

                // Ensure labels are clear
                firstStep.certifications = firstStep.certifications.map(c => ({
                    ...c,
                    isFree: c.isFree !== undefined ? c.isFree : (c.url?.toLowerCase().includes('free') || !c.name?.toLowerCase().includes('pro'))
                }));
            }
        }

        res.json(result);

    } catch (err) {
        console.error('Groq Eligibility Error:', err);
        res.status(500).json({ message: 'AI Eligibility check error', error: err.message });
    }
});

// AI Career Roadmap Generator
router.post('/roadmap', auth, async (req, res) => {
    try {
        const { dreamJob } = req.body;
        console.log('Generating Roadmap for user:', req.user.id, 'Dream Job:', dreamJob);

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            console.error('GROQ_API_KEY is not configured correctly in .env');
            return res.status(500).json({ message: 'AI Service configuration error. Please set GROQ_API_KEY in .env' });
        }

        if (!dreamJob) return res.status(400).json({ message: 'Dream job title is required' });

        let user = null;
        if (mongoose.Types.ObjectId.isValid(req.user.id)) {
            user = await User.findById(req.user.id);
        }
        if (!user && req.user.id) {
            user = await User.findOne({ uid: req.user.id });
        }

        let userSkills = ['Software Development', 'Problem Solving', 'Communication'];
        if (user && Array.isArray(user.skills) && user.skills.length > 0) {
            userSkills = user.skills;
        } else if (user && typeof user.skills === 'string' && user.skills.trim()) {
            userSkills = user.skills.split(',').map(s => s.trim());
        }

        const systemPrompt = `You are an expert career coach. Create detailed, actionable career roadmaps. Always respond with valid JSON only.`;

        const userPrompt = `
Create a detailed 6-month career roadmap for a student to become a ${dreamJob}.
Current User Skills: ${userSkills.join(', ')}

Respond with this exact JSON structure:
{
    "dreamJob": "${dreamJob}",
    "phases": [
        {
            "month": "Month 1-2: Foundations",
            "topics": ["topic1", "topic2", "topic3"],
            "actionItems": ["action1", "action2", "action3"]
        },
        {
            "month": "Month 3-4: Building Skills",
            "topics": ["topic1", "topic2", "topic3"],
            "actionItems": ["action1", "action2", "action3"]
        },
        {
            "month": "Month 5-6: Advanced & Job Ready",
            "topics": ["topic1", "topic2", "topic3"],
            "actionItems": ["action1", "action2", "action3"]
        }
    ],
    "recommendedResources": [
        {"name": "Resource Name", "url": "https://actual-link-to-resource.com"},
        {"name": "Course/Tutorial Name", "url": "https://course-url.com"},
        {"name": "Documentation", "url": "https://docs-url.com"},
        {"name": "YouTube Channel/Video", "url": "https://youtube.com/video"}
    ]
}

IMPORTANT: For recommendedResources, provide helpful learning resources. The frontend will automatically map topics to verified YouTube playlists for visual learning. Provide 3-5 high-quality links to platforms like:
- freeCodeCamp (freecodecamp.org)
- Coursera/Udemy/LinkedIn Learning (for certifications)
- Official Documentation (MDN, w3schools, etc.)
- GitHub repositories for project examples
`;

        const response = await callGroq(systemPrompt, userPrompt, true);
        console.log('Groq Raw Response (Roadmap):', response);

        let roadmap;
        try {
            roadmap = JSON.parse(response);
        } catch (e) {
            roadmap = extractJson(response);
        }

        // Add real, curated learning resources from database
        const realResources = getResourcesForRole(dreamJob);

        // Convert the curated resources into the format expected by frontend
        const formattedResources = [];
        if (realResources.youtube) {
            formattedResources.push(...realResources.youtube);
        }
        if (realResources.courses) {
            formattedResources.push(...realResources.courses);
        }
        if (realResources.certifications) {
            formattedResources.push(...realResources.certifications);
        }
        if (realResources.documentation) {
            formattedResources.push(...realResources.documentation);
        }

        // Replace AI-generated resources with real ones
        roadmap.recommendedResources = formattedResources;

        // Ensure dreamJob is present (critical for interview questions feature)
        roadmap.dreamJob = dreamJob;

        res.json(roadmap);

    } catch (err) {
        console.error('Groq Roadmap Error:', err);
        res.status(500).json({ message: 'AI Roadmap generation error', error: err.message });
    }
});

// Interview Questions Endpoint
router.post('/interview-questions', auth, async (req, res) => {
    try {
        const { role } = req.body;
        console.log('Fetching interview questions for role:', role);

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        // Get questions organized by round
        const questionsByRound = getQuestionsByRound(role);

        res.json({
            role,
            questionsByRound,
            totalQuestions: Object.values(questionsByRound).reduce((sum, questions) => sum + questions.length, 0)
        });

    } catch (err) {
        console.error('Interview Questions Error:', err);
        res.status(500).json({ message: 'Failed to fetch interview questions', error: err.message });
    }
});

// General AI Chat for Career Guidance
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, chatHistory } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: 'AI Service configuration error. Please set GROQ_API_KEY in .env' });
        }

        const systemPrompt = `You are an elite AI Career Coach and Architect. Your goal is to provide helpful, professional, and encouraging career advice.

GUIDELINES:
- For general conversation (greetings, small talk), be friendly and concise.
- For career advice, be professional and insightful.
- If the user explicitly asks for a "Roadmap" or "Job Analysis", guide them to use the specific UI buttons for those features.
- Keep responses natural and engaging.
- Be encouraging and supportive.`;

        // Convert chat history to Groq format
        const messages = [{ role: 'system', content: systemPrompt }];

        if (chatHistory && Array.isArray(chatHistory)) {
            chatHistory.forEach(msg => {
                if (msg.role === 'user' || msg.role === 'model') {
                    messages.push({
                        role: msg.role === 'model' ? 'assistant' : 'user',
                        content: msg.parts?.[0]?.text || msg.content || ''
                    });
                }
            });
        }

        messages.push({ role: 'user', content: message });

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: messages,
            temperature: 0.8,
            max_tokens: 500
        });

        const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        res.json({ text: responseText });

    } catch (err) {
        console.error('Groq Chat Error:', err);
        res.status(500).json({ message: 'AI Chat error', error: err.message });
    }
});


// Career Advice Based on Saved Applications
router.post('/career-advice', auth, async (req, res) => {
    try {
        console.log('Generating career advice for user:', req.user.id);

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: 'AI Service configuration error. Please set GROQ_API_KEY in .env' });
        }

        // Fetch user info
        let user = null;
        if (mongoose.Types.ObjectId.isValid(req.user.id)) {
            user = await User.findById(req.user.id);
        }
        if (!user && req.user.id) {
            user = await User.findOne({ uid: req.user.id });
        }

        // Fetch user's applications
        let applications = [];
        if (user) {
            applications = await Application.find({ student: user._id })
                .sort({ appliedDate: -1 })
                .limit(20)
                .lean();
        }

        const userSkills = user?.skills || ['General Skills'];
        const userName = user?.name || 'User';

        // Build application summary for AI
        const applicationSummary = applications.length > 0
            ? applications.map(app => ({
                company: app.company,
                role: app.role,
                status: app.status,
                appliedDate: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A',
                matchPercentage: app.matchPercentage || 'N/A'
            }))
            : [];

        const statusCounts = {
            total: applications.length,
            applied: applications.filter(a => a.status === 'Applied').length,
            interview: applications.filter(a => a.status === 'Interview').length,
            offer: applications.filter(a => a.status === 'Offer').length,
            rejected: applications.filter(a => a.status === 'Rejected').length
        };

        const systemPrompt = `You are an elite AI Career Coach. Provide personalized, actionable career advice based on the user's job application history and profile. Be encouraging but realistic. Focus on patterns, improvements, and strategic next steps.`;

        const userPrompt = `
Analyze this user's job search progress and provide strategic career advice.

USER PROFILE:
- Name: ${userName}
- Skills: ${userSkills.join(', ')}

APPLICATION HISTORY (${statusCounts.total} total applications):
- Applied: ${statusCounts.applied}
- In Interview: ${statusCounts.interview}
- Offers: ${statusCounts.offer}
- Rejected: ${statusCounts.rejected}

RECENT APPLICATIONS:
${JSON.stringify(applicationSummary.slice(0, 10), null, 2)}

Respond with this exact JSON structure:
{
    "overallAssessment": "Brief assessment of their job search progress (2-3 sentences)",
    "strengths": ["strength1", "strength2", "strength3"],
    "areasToImprove": ["area1", "area2"],
    "strategicAdvice": [
        {
            "title": "Advice Title",
            "description": "Detailed actionable advice",
            "priority": "high/medium/low"
        }
    ],
    "roleRecommendations": ["Role 1 they should consider", "Role 2"],
    "nextSteps": ["Immediate action 1", "Immediate action 2", "Immediate action 3"],
    "motivationalMessage": "A personalized encouraging message for ${userName}"
}

IMPORTANT: 
- If they have interviews pending, provide interview preparation tips specific to those companies/roles.
- If they have rejections, analyze patterns and suggest improvements.
- If they have offers, congratulate and help them decide.
- If no applications yet, encourage them to start and provide guidance.
- Reference specific companies and roles from their history when relevant.`;

        const response = await callGroq(systemPrompt, userPrompt, true);
        console.log('Groq Raw Response (Career Advice):', response);

        let advice;
        try {
            advice = JSON.parse(response);
        } catch (e) {
            advice = extractJson(response);
        }

        res.json({
            ...advice,
            applicationStats: statusCounts
        });

    } catch (err) {
        console.error('Career Advice Error:', err);
        res.status(500).json({ message: 'Failed to generate career advice', error: err.message });
    }
});

module.exports = router;
