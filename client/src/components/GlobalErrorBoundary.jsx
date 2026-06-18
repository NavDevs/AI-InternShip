import React from 'react';

/**
 * GlobalErrorBoundary - catches any unhandled render errors in the whole app.
 * Prevents a full white screen by showing a friendly recovery UI instead.
 */
class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[GlobalErrorBoundary] Caught error:', error, info);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Clear any corrupt localStorage that may have triggered the crash
        try {
            Object.keys(localStorage)
                .filter(k => k.startsWith('careerBot_') || k.startsWith('analyzer_'))
                .forEach(k => localStorage.removeItem(k));
        } catch (_) { /* ignore */ }
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 flex items-center justify-center bg-[#f8f7f4] dark:bg-[#1a1a2e] p-6">
                    <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-red-200 dark:border-red-800/50 rounded-2xl p-8 text-center shadow-lg">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                            The app encountered an unexpected error. Click below to reset and return to the Dashboard.
                        </p>
                        <details className="text-left mb-6">
                            <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600 dark:hover:text-stone-300">
                                Show error details
                            </summary>
                            <pre className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </pre>
                        </details>
                        <button
                            onClick={this.handleReset}
                            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                        >
                            Reset & Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default GlobalErrorBoundary;
