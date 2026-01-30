const { sanitizeLink } = require('../utils/learningResources');

const testCases = [
    {
        name: 'Normal URL',
        input: { name: 'React Course', url: 'https://www.coursera.org/react' },
        expected: 'https://www.coursera.org/react'
    },
    {
        name: 'Placeholder URL (actual-url.com)',
        input: { name: 'Node.js Course', url: 'https://actual-url.com' },
        type: 'resource',
        expected: 'https://www.google.com/search?q=Node.js%20Course+learning+resources'
    },
    {
        name: 'Placeholder URL (example.com)',
        input: { name: 'Python Basics', url: 'https://example.com/course' },
        type: 'certification',
        expected: 'https://www.coursera.org/search?query=Python%20Basics'
    },
    {
        name: 'YouTube Placeholder',
        input: { name: 'JavaScript Tutorial', url: 'https://youtube.com/video' },
        type: 'youtube',
        expected: 'https://www.youtube.com/results?search_query=JavaScript%20Tutorial+tutorial'
    },
    {
        name: 'Ellipsis Placeholder',
        input: { name: 'AWS Cloud', url: 'https://...' },
        type: 'certification',
        expected: 'https://www.coursera.org/search?query=AWS%20Cloud'
    }
];

console.log('--- Testing Link Sanitation ---');
let passed = 0;
testCases.forEach(tc => {
    const result = sanitizeLink({ ...tc.input }, tc.type);
    if (result.url === tc.expected) {
        console.log(`✅ [PASS] ${tc.name}`);
        passed++;
    } else {
        console.log(`❌ [FAIL] ${tc.name}`);
        console.log(`   Expected: ${tc.expected}`);
        console.log(`   Got:      ${result.url}`);
    }
});

console.log(`\nResults: ${passed}/${testCases.length} passed.`);
if (passed === testCases.length) {
    process.exit(0);
} else {
    process.exit(1);
}
