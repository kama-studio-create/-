import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
      if (!window.Telegram?.WebApp) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  telegramLogin: (telegramData) => api.post('/auth/telegram-login', telegramData),
  validateToken: (token) => api.post('/auth/validate', { token }),
  logout: () => api.post('/auth/logout'),
};

export const userService = {
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (userId, data) => api.patch(`/users/profile/${userId}`, data),
  getStats: (userId) => api.get(`/users/stats/${userId}`),
};

export const gameService = {
  getAllCards: () => api.get('/cards/all'),
  getUserCards: (userId) => api.get(`/cards/user/${userId}`),
  getDeck: (telegramId) => api.get(`/deck/${telegramId}`),
  saveDeck: (data) => api.post('/deck/save', data),
  validateDeck: (deck) => api.post('/deck/validate', { deck }),
};

export const dailyService = {
  getStatus: (userId) => api.get(`/daily/status/${userId}`),
  claimReward: (userId) => api.post('/daily/claim', { userId }),
};

export const clanService = {
  getClans: (params) => api.get('/clans', { params }),
  getClan: (clanId) => api.get(`/clans/${clanId}`),
  createClan: (data) => api.post('/clans/create', data),
  joinClan: (data) => api.post('/clans/join', data),
  leaveClan: (data) => api.post('/clans/leave', data),
  donate: (data) => api.post('/clans/donate', data),
  sendMessage: (data) => api.post('/clans/message', data),
};

export const tournamentService = {
  getTournaments: (params) => api.get('/tournament/list', { params }),
  joinTournament: (data) => api.post('/tournament/join', data),
  getTournamentBracket: (tournamentId) => api.get(`/tournament/${tournamentId}/bracket`),
};

export const marketplaceService = {
  getListings: (params) => api.get('/marketplace/listings', { params }),
  listCard: (data) => api.post('/marketplace/list', data),
  buyCard: (data) => api.post('/marketplace/buy', data),
  cancelListing: (listingId) => api.delete(`/marketplace/listings/${listingId}`),
};

export const leaderboardService = {
  getTopPlayers: (params) => api.get('/leaderboard/top', { params }),
  getPlayerRank: (userId) => api.get(`/leaderboard/rank/${userId}`),
  getLeagueLeaderboard: () => api.get('/league/leaderboard'),
};

export default api;