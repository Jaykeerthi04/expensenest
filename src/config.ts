const config = {
  API_URL: process.env.NODE_ENV === 'production'
    ? process.env.VITE_API_URL || 'https://your-backend-url.com'
    : 'http://localhost:5000',
};

export default config; 