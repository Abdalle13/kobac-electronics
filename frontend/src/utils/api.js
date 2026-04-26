import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // We will retrieve the token from localStorage or Redux store
    // Assuming we store userInfo in localStorage as strings via Redux
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional, but good for handling 401s globally)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // You could dispatch a logout action here if you want
      // For now, we'll just let the components handle it or add custom logic later
    }
    return Promise.reject(error);
  }
);

export default api;
