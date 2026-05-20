import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // Cookie yuborish uchun SHART
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — 401 bo'lsa login ga yuborish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;