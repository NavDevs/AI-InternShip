import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

// Lazy load all pages — each gets its own JS chunk, nothing loads until needed
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const JobListings = lazy(() => import('./pages/JobListings'));
const ApplicationTracker = lazy(() => import('./pages/ApplicationTracker'));
const AIAnalyzer = lazy(() => import('./pages/AIAnalyzer'));
const Profile = lazy(() => import('./pages/Profile'));
const CareerBot = lazy(() => import('./pages/CareerBot'));
const JobDetail = lazy(() => import('./pages/JobDetail'));

// Full-screen loading spinner used by Suspense fallback and PrivateRoute
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#f8f7f4] dark:bg-[#1a1a2e]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="text-sm text-stone-500 dark:text-stone-400">Loading...</span>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  // While Firebase is resolving auth state, show full-screen loader — no flash
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

// Subtle fade-in — no y-shift to avoid layout jump between pages
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
);

// Inner app needs to be its own component so useLocation works inside Router
const AppRoutes = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#1a1a2e] transition-colors duration-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* AnimatePresence enables exit animations when switching routes */}
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/dashboard" element={<PrivateRoute><PageWrapper><Dashboard /></PageWrapper></PrivateRoute>} />
              <Route path="/jobs" element={<PrivateRoute><PageWrapper><JobListings /></PageWrapper></PrivateRoute>} />
              <Route path="/job/:id" element={<PrivateRoute><PageWrapper><JobDetail /></PageWrapper></PrivateRoute>} />
              <Route path="/tracker" element={<PrivateRoute><PageWrapper><ApplicationTracker /></PageWrapper></PrivateRoute>} />
              <Route path="/analyzer" element={<PrivateRoute><PageWrapper><AIAnalyzer /></PageWrapper></PrivateRoute>} />
              <Route path="/bot" element={<PrivateRoute><PageWrapper><CareerBot /></PageWrapper></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><PageWrapper><Profile /></PageWrapper></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
