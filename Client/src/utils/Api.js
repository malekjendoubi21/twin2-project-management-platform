import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.config.url.includes('/auth/register')) {
      return Promise.reject(error);
    }
    // Skip handling for login endpoint
    if (error.config.url.includes('/auth/login')) {
      return Promise.reject(error);
    }
        // Skip handling for "already invited" errors
        if (error.response?.status === 400 && 
          error.config.url.includes('/invite') && 
          error.response?.data?.message === 'An invitation has already been sent to this email') {
        return Promise.reject(error);
      }
    if (axios.isCancel(error) || 
        error.code === 'ERR_CANCELED' || 
        (error.message && error.message.toLowerCase() === 'canceled')) {
      // Return a resolved promise to prevent error cascading for cancellations
      return Promise.resolve({ status: 'canceled', data: null });
    }
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expirée. Veuillez vous reconnecter.', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#f44336',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px'
          }
        });
        window.location.href = '/login';
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error || 
                        error.message || 
                        'Une erreur est survenue';
    
    toast.error(errorMessage, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#f44336',
        color: '#fff',
        padding: '16px',
      }
    });

    return Promise.reject(error);
  }
);

export default api;