import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import JobListings from './pages/JobListings';
import ApplicationTracker from './pages/ApplicationTracker';
import AIAnalyzer from './pages/AIAnalyzer';
import Profile from './pages/Profile';
import CareerBot from './pages/CareerBot';
import JobDetail from './pages/JobDetail';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin border-2 border-black border-t-transparent"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Simple page wrapper with minimal animation
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.15 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen text-text-primary bg-chassis texture-noise font-sans">
          {/* Ambient Background layer */}
          <div className="ambient-bg">
            <div className="ambient-blob ambient-blob-1"></div>
            <div className="ambient-blob ambient-blob-2"></div>
            <div className="ambient-blob ambient-blob-3"></div>
          </div>

          {/* Skip Navigation Link for Accessibility */}
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-600 text-white px-4 py-2 rounded-lg z-[100] font-bold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          >
            Skip to main content
          </a>
          
          <Navbar />
          <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
            <Routes>
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
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
