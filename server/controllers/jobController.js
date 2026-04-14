const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 15 minutes
const jobCache = new NodeCache({ stdTTL: 900 });

const getLiveJobs = async (req, res) => {
    const { keyword = 'internship', location, page = 1 } = req.query;

    // Create a unique cache key based on query params
    const cacheKey = `jsearch_${keyword}_${location}_${page}`;

    if (jobCache.has(cacheKey)) {
        return res.json(jobCache.get(cacheKey));
    }

    try {
        const rapidApiKey = process.env.RAPIDAPI_KEY;

        // Fallback to mock data if API key is missing
        if (!rapidApiKey || rapidApiKey === 'your_key_here') {
            const mockJobs = [
                {
                    id: 'mock_v2_1',
                    title: 'Python Full Stack Using AI',
                    company: 'KodNest Technologies Pvt Ltd',
                    location: location || 'Bengaluru Urban',
                    workMode: 'On-site (Offline)',
                    duration: '4 Months',
                    fees: '₹23,999',
                    description: 'A 4-month project-driven Python internship where VTU students build one complete system...',
                    applyBy: '2026-05-31',
                    link: 'https://kodnest.com',
                    postedAt: new Date().toISOString(),
                    source: 'live',
                    logo: 'https://logo.clearbit.com/kodnest.com'
                },
                {
                    id: 'mock_v2_2',
                    title: 'Data Science Using AI Internship',
                    company: 'KodNest Technologies Pvt Ltd',
                    location: location || 'Bengaluru Urban',
                    workMode: 'Hybrid',
                    duration: '4 Months',
                    fees: '₹23,999',
                    description: 'A 4-month beginner-friendly data science internship where VTU students build one insight...',
                    applyBy: '2026-03-31',
                    link: 'https://kodnest.com',
                    postedAt: new Date().toISOString(),
                    source: 'live',
                    logo: 'https://logo.clearbit.com/kodnest.com'
                }
            ];
            
            // Filter mock data based on search keyword
            const filteredJobs = mockJobs.filter(job => {
                const searchLower = keyword.toLowerCase();
                return (
                    job.title.toLowerCase().includes(searchLower) ||
                    job.company.toLowerCase().includes(searchLower) ||
                    job.description.toLowerCase().includes(searchLower)
                );
            });
            
            return res.json(filteredJobs);
        }

        const options = {
            method: 'GET',
            url: 'https://jsearch.p.rapidapi.com/search',
            params: {
                query: `${keyword} in ${location || 'India'}`,
                page: page.toString(),
                num_pages: '1'
            },
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);

        const jobs = response.data.data.map(job => ({
            id: job.job_id,
            title: job.job_title,
            company: job.employer_name,
            location: `${job.job_city || ''} ${job.job_state || ''} ${job.job_country || ''}`.trim(),
            workMode: job.job_is_remote ? 'Remote' : 'On-site',
            duration: 'Flexible', // JSearch doesn't always provide duration clearly
            fees: (job.job_min_salary || job.job_max_salary) ? `₹${job.job_min_salary || job.job_max_salary}` : 'Paid',
            description: job.job_description?.substring(0, 200) + '...',
            applyBy: job.job_offer_expiration_datetime_utc ? new Date(job.job_offer_expiration_datetime_utc).toLocaleDateString() : 'ASAP',
            link: job.job_apply_link,
            postedAt: job.job_posted_at_datetime_utc,
            source: 'live',
            logo: job.employer_logo || `https://logo.clearbit.com/${job.employer_name.replace(/\s+/g, '').toLowerCase()}.com`
        }));

        jobCache.set(cacheKey, jobs);
        res.json(jobs);
    } catch (err) {
        console.error('JSearch API Error:', err.message);
        res.status(500).json({ message: 'Failed to fetch live jobs', error: err.message });
    }
};

module.exports = { getLiveJobs };
