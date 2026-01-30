import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Simple page wrapper with animation
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
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
            </div>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
