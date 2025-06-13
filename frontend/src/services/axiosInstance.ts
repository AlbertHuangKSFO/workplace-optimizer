import axios from 'axios';

// Support both NEXT_PUBLIC_API_URL (Docker) and NEXT_PUBLIC_API_BASE_URL (local) for backward compatibility
// In Docker environment, API calls should go to the backend container
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000/api';

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
