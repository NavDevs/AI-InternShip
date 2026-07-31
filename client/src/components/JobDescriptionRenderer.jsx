import React from 'react';

const JobDescriptionRenderer = ({ text, className = "" }) => {
    if (!text) return <p className={className}>No description available.</p>;

    // 1. Strip raw HTML tags just in case
    let cleanText = text.replace(/<[^>]*>?/gm, '\n');

    // 2. Add newlines before common headings to break up the wall of text
    const headings = [
        "What You Will Actually Do:",
        "What You Will Do:",
        "Who We Are Looking For:",
        "Requirements:",
        "Qualifications:",
        "What's In It For You:",
        "Benefits:",
        "About The Role",
        "About You",
        "Role Responsibilities"
    ];

    headings.forEach(heading => {
        // Look for the heading, optionally preceded by a space, and add double newline
        cleanText = cleanText.replace(new RegExp(`(${heading})`, 'gi'), '\n\n$1\n');
    });

    // 3. Add newlines before bullet points (•, *, or - ) if they aren't already on a new line
    cleanText = cleanText.replace(/([^\n])(\s*[•*]\s+|\s+-\s+)/g, '$1\n\n$2');

    // 4. Clean up excessive newlines
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

    return (
        <div className={`space-y-3 ${className}`}>
            {cleanText.split('\n\n').map((paragraph, idx) => {
                const p = paragraph.trim();
                if (!p) return null;

                // Check if this paragraph is a heading (ends with colon or matches our known headings)
                const isHeading = p.endsWith(':') || headings.some(h => p.toLowerCase().includes(h.toLowerCase()));

                if (isHeading) {
                    return (
                        <h4 key={idx} className="font-semibold text-stone-900 dark:text-stone-100 mt-4 mb-1">
                            {p}
                        </h4>
                    );
                }

                // Render lines within paragraph (handling bullets)
                const lines = p.split('\n');
                if (lines.length > 1 || p.startsWith('•') || p.startsWith('-') || p.startsWith('*')) {
                    return (
                        <ul key={idx} className="list-disc pl-5 space-y-1.5 marker:text-stone-400">
                            {lines.map((line, lIdx) => {
                                const cleanLine = line.replace(/^[•*\-\s]+/, '').trim();
                                if (!cleanLine) return null;
                                return <li key={lIdx} className="leading-relaxed">{cleanLine}</li>;
                            })}
                        </ul>
                    );
                }

                // Regular paragraph
                return (
                    <p key={idx} className="leading-relaxed">
                        {p}
                    </p>
                );
            })}
        </div>
    );
};

export default JobDescriptionRenderer;
