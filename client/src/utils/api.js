// Replace this with your actual Render URL after deployment
const RENDER_BACKEND_URL = 'https://your-backend-name.onrender.com/api';

export const API_BASE_URL = import.meta.env.PROD
    ? RENDER_BACKEND_URL
    : 'http://127.0.0.1:5000/api';

// NOTE: To use the cloud backend while developing locally,
// you can temporary change the line above to:
// : RENDER_BACKEND_URL;
