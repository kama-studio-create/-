import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getDailyReward: () => api.post('/user/daily-reward'),
};

export const gameService = {
  getDeck: () => api.get('/deck'),
  updateDeck: (data) => api.put('/deck', data),
  getCards: () => api.get('/cards'),
  getBattleHistory: () => api.get('/battles/history'),
};

export const marketService = {
  getListings: () => api.get('/market/listings'),
  createListing: (data) => api.post('/market/listings', data),
  buyCard: (id) => api.post(`/market/listings/${id}/buy`),
};

export default api;
