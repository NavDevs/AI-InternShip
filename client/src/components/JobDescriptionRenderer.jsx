import React from 'react';

const JobDescriptionRenderer = ({ text, className = "" }) => {
    if (!text) return <p className={className}>No description available.</p>;

    // 1. Strip raw HTML tags just in case
    let cleanText = text.replace(/<[^>]*>?/gm, '\n');

    // Normalize bullet characters (catches strange unicodes, empty square boxes, \uFFFD, etc)
    // Replace them all with a standard bullet '•'
    cleanText = cleanText.replace(/^[ \t]*[•*\-○●■□◆◇►▪▫▶\uF0B7\uF0A7\u2022\u25A0\u25A1\u25CF\u25CB\u2023\u2043\u2219\u25AA\u25AB\uFFFD][ \t]+/gm, '• ');
    
    // Also replace inline bullet characters (not at the start of a line) with a newline + bullet
    cleanText = cleanText.replace(/([^\n])([ \t]+[•○●■□◆◇►▪▫▶\uF0B7\uF0A7\u2022\u25A0\u25CF\uFFFD][ \t]+)/g, '$1\n• ');

    // 2. Add newlines before common headings to break up the wall of text
    const headings = [
        "What You Will Actually Do",
        "What You Will Do",
        "Who We Are Looking For",
        "Requirements",
        "Key Responsibilities",
        "Responsibilities",
        "Qualifications",
        "What's In It For You",
        "Benefits",
        "About The Role",
        "About You",
        "Role Responsibilities"
    ];

    headings.forEach(heading => {
        // Look for the heading (with optional colon), and add double newline
        cleanText = cleanText.replace(new RegExp(`(^|\\n)\\s*(${heading})\\s*:?\\s*(\\n|$)`, 'gim'), '\n\n$2:\n');
    });

    // 4. Clean up excessive newlines
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

    // Split into structural blocks
    const blocks = cleanText.split('\n\n').map(p => p.trim()).filter(Boolean);

    return (
        <div className={`space-y-4 ${className}`}>
            {blocks.map((block, idx) => {
                // Check if this block is a heading
                const isHeading = block.endsWith(':') || headings.some(h => block.toLowerCase() === h.toLowerCase() || block.toLowerCase() === `${h.toLowerCase()}:`);

                if (isHeading) {
                    return (
                        <h4 key={idx} className="font-semibold text-stone-900 dark:text-stone-100 mt-5 mb-2 border-b border-stone-200 dark:border-stone-800 pb-1">
                            {block}
                        </h4>
                    );
                }

                // Split block into lines to check for lists
                const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                
                // If a majority of lines in this block start with a bullet or hyphen, render as list
                const listItems = lines.filter(l => l.startsWith('•') || l.startsWith('-'));
                
                if (listItems.length > 0 && (listItems.length > lines.length / 2 || listItems.length === lines.length)) {
                    return (
                        <ul key={idx} className="list-outside list-disc pl-4 space-y-2 marker:text-stone-400">
                            {lines.map((line, lIdx) => {
                                const cleanLine = line.replace(/^[•*\-\s]+/, '').trim();
                                if (!cleanLine) return null;
                                return <li key={lIdx} className="leading-relaxed pl-1">{cleanLine}</li>;
                            })}
                        </ul>
                    );
                }

                // Regular paragraph
                return (
                    <p key={idx} className="leading-relaxed text-stone-600 dark:text-stone-300">
                        {block}
                    </p>
                );
            })}
        </div>
    );
};

export default JobDescriptionRenderer;
