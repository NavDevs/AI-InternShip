import axios from 'axios';

// API Base URL Configuration
const LOCAL_BACKEND_URL = 'http://localhost:5000/api';
const PROD_BACKEND_URL = import.meta.env.VITE_API_URL || 'https://ai-internship.onrender.com/api';

// Automatically use production URL when not in development
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
export const API_BASE_URL = isDevelopment ? LOCAL_BACKEND_URL : PROD_BACKEND_URL;

// Create a pre-configured axios instance with timeout and base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s timeout — prevents requests hanging forever
    headers: {
        'Content-Type': 'application/json',
    }
});

// Global response interceptor — catches network errors and surfaces them cleanly
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return Promise.reject({
                ...error,
                message: 'Request timed out. The server may be starting up — please try again in a moment.'
            });
        }
        if (!error.response) {
            return Promise.reject({
                ...error,
                message: 'Cannot connect to server. Please check your internet connection.'
            });
        }
        return Promise.reject(error);
    }
);

export default api;
