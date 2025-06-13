import axios from 'axios';

// Always use the Next.js API proxy route, not direct backend access
// This allows Next.js rewrites to handle the backend routing
const API_BASE_URL = '/api';

console.log('[axiosInstance] API_BASE_URL configured as:', API_BASE_URL);
console.log('[axiosInstance] Environment variables:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Optional: You can add interceptors here if needed in the future
// axiosInstance.interceptors.request.use(config => {
// // e.g., add auth token
// return config;
// });

// axiosInstance.interceptors.response.use(
// response => response,
// error => {
// // e.g., global error handling
// return Promise.reject(error);
// }
// );

export default axiosInstance;
