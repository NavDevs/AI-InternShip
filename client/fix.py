import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        # Typography base
        (r'text-stone-900 dark:text-stone-100', r'text-white'),
        (r'text-stone-800 dark:text-stone-200', r'text-brand-50'),
        (r'text-stone-700 dark:text-stone-300', r'text-brand-50'),
        (r'text-stone-600 dark:text-stone-400', r'text-text-muted'),
        (r'text-stone-500 dark:text-stone-400', r'text-text-secondary'),
        (r'text-stone-[45]00', r'text-text-muted'),
        (r'text-stone-300 dark:text-stone-600', r'text-white/20'),
        
        # Containers
        (r'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl', r'glass-panel rounded-2xl'),
        (r'bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-700 rounded-xl', r'glass-panel rounded-2xl border border-dashed border-white/20'),
        (r'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800', r'glass-card'),
        
        # Inputs & Selects
        (r'rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800', r'rounded-xl glass-input'),
        (r'focus:border-primary focus:ring-1 focus:ring-primary', r'focus:border-brand-500 focus:ring-1 focus:ring-brand-500'),
        
        # Borders & Backgrounds
        (r'border-b border-stone-100 dark:border-stone-800', r'border-b border-white/10'),
        (r'divide-stone-100 dark:divide-stone-800', r'divide-white/10'),
        (r'hover:bg-stone-50 dark:hover:bg-stone-800/50', r'hover:bg-white/5'),
        (r'bg-stone-100 dark:bg-stone-800', r'bg-white/10'),
        (r'bg-stone-200 dark:bg-stone-800', r'bg-white/20'),
        (r'bg-stone-50 dark:bg-stone-800', r'bg-white/5'),
        (r'border border-stone-200 dark:border-stone-700', r'border border-white/10'),
        (r'bg-stone-50/50 dark:bg-stone-900/50', r'bg-white/5 border-t border-white/5'),
        
        # Component specifically
        (r'animate-fade-in', r'animate-fade-in font-outfit'),
        
        # Brand primary colors
        (r'text-primary', r'text-brand-400'),
        (r'bg-primary', r'bg-brand-600'),
        (r'border-primary', r'border-brand-500'),
        (r'hover:text-primary', r'hover:text-brand-300'),
        (r'hover:bg-primary', r'hover:bg-brand-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'),
        
        # State Badges
        (r'bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400', r'bg-emerald-500/10 px-2.5 py-1 text-xs font-medium border border-emerald-500/30 text-emerald-400'),
        (r'bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400', r'bg-blue-500/10 px-2.5 py-1 text-xs font-medium border border-blue-500/30 text-blue-400'),
        (r'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-3 text-sm text-amber-700 dark:text-amber-400', r'glass-card border-amber-500/30 p-3 text-sm text-amber-400 bg-amber-500/5'),
        (r'bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2.5 border border-amber-100 dark:border-amber-900/30', r'bg-amber-500/5 rounded-lg p-2.5 border border-amber-500/20'),
        (r'text-amber-700 dark:text-amber-400', r'text-amber-400'),
        
        (r'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', r'bg-orange-500/10 border border-orange-500/30 text-orange-400'),
        
        (r'hover:bg-blue-50 dark:hover:bg-blue-900/20', r'hover:bg-blue-500/20'),
        (r'hover:bg-rose-50 dark:hover:bg-rose-900/20', r'hover:bg-rose-500/20'),
        
        # Tracker Table spec.
        (r'text-xs font-medium text-text-secondary uppercase tracking-wide', r'text-[10px] font-semibold text-text-muted uppercase tracking-widest'),
        (r'text-xs font-medium text-stone-500 uppercase tracking-wide', r'text-[10px] font-semibold text-text-muted uppercase tracking-widest'),
        (r'bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800', r'glass-panel rounded-2xl'),
    ]

    for old, new in replacements:
        content = re.sub(old, new, content)

    # Some manual stuff
    content = content.replace('bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden', 'glass-panel rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]')
    content = content.replace('bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6', 'glass-card rounded-2xl p-6')
    content = content.replace('col-span-full py-20 text-center bg-white dark:bg-stone-900 rounded-xl border border-dashed border-stone-200 dark:border-stone-700', 'col-span-full py-20 text-center glass-panel rounded-2xl border border-dashed border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

try:
    process_file('src/pages/ApplicationTracker.jsx')
    process_file('src/pages/JobListings.jsx')
    print("Replacements successful")
except Exception as e:
    print(e)
