import axios from 'axios';

// Ensure NEXT_PUBLIC_API_BASE_URL is defined in your frontend/.env.local or environment
// It should point to your backend API, e.g., http://localhost:8000/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
