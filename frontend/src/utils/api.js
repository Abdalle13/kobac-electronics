import axios from 'axios';
import { isTokenExpired, clearStoredUser } from './authToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the JWT, unless it has already expired.
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('userInfo');
      const userInfo = raw ? JSON.parse(raw) : null;
      if (userInfo?.token && !isTokenExpired(userInfo.token)) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch {
      /* ignore malformed storage */
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On a 401 for anything other than the sign-in / register calls themselves,
// the session is dead: clear it and send the user to the login page once.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthAttempt = url.includes('/users/login') || url.includes('/users/register');

    if (status === 401 && !isAuthAttempt && localStorage.getItem('userInfo')) {
      clearStoredUser();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
