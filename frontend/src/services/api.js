import axios from 'axios';

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Smart auto-correction and fallback for production cloud deployment
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  if (!apiBaseUrl) {
    apiBaseUrl = 'https://defense-backend-uarg.onrender.com';
  }
}

if (apiBaseUrl.startsWith('http://')) {
  apiBaseUrl = apiBaseUrl.replace('http://', 'https://');
}

if (apiBaseUrl.includes('defence-backend-uarg')) {
  apiBaseUrl = apiBaseUrl.replace('defence-backend-uarg', 'defense-backend-uarg');
}

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
