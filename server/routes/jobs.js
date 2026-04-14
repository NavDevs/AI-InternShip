const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth, admin } = require('../middleware/auth');
const { getLiveJobs } = require('../controllers/jobController');

// Create Job (Admin Only)
router.post('/', auth, admin, async (req, res) => {
    try {
        const job = new Job({ ...req.body, postedBy: req.user.id });
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Live Jobs (Real-time API)
router.get('/live', getLiveJobs);

const NodeCache = require('node-cache');
const jobCache = new NodeCache({ stdTTL: 900 }); // 15 minutes TTL
const { INDIAN_STATES } = require('../utils/constants');

// Get All Active Jobs (with location-based filtering and caching)
router.get('/', async (req, res) => {
    try {
        const { role, company, skills, state, keyword, type } = req.query;

        // Validation for state
        if (state && !INDIAN_STATES.includes(state)) {
            return res.status(400).json({ message: 'Invalid state parameter' });
        }

        const cacheKey = JSON.stringify(req.query);
        const cachedData = jobCache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        let query = { status: 'active' };

        // Support keyword search across multiple fields
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { company: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (role) {
            if (query.$or) {
                query.$or.push({ title: { $regex: role, $options: 'i' } });
            } else {
                query.title = { $regex: role, $options: 'i' };
            }
        }
        
        if (company) {
            if (query.$or) {
                query.$or.push({ company: { $regex: company, $options: 'i' } });
            } else {
                query.company = { $regex: company, $options: 'i' };
            }
        }
        
        if (skills) query.requiredSkills = { $in: skills.split(',') };

        // Filter by job type (internship vs full-time)
        if (type) {
            query.type = type;
        }

        if (state) {
            const locationFilter = {
                $or: [
                    { location: { $regex: 'Remote', $options: 'i' } },
                    { location: { $regex: 'Hybrid', $options: 'i' } },
                    { location: { $regex: state, $options: 'i' } }
                ]
            };
            
            // Combine with existing query
            query = { $and: [query, locationFilter] };
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        jobCache.set(cacheKey, jobs);
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Latest Jobs (Recently Published)
router.get('/latest', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'active' }).sort({ createdAt: -1 }).limit(10);
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Single Job
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update Job (Admin Only)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete Job (Admin Only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
