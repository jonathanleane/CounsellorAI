import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Profile API
export const profileApi = {
  get: () => api.get('/profile'),
  create: (data: any) => api.post('/profile', data),
  update: (data: any) => api.put('/profile', data),
  getBrain: () => api.get('/profile/brain'),
  updateBrain: (category: string, field: string, value: any) =>
    api.post('/profile/brain', { category, field, value }),
};

// Sessions API
export const sessionsApi = {
  getAll: () => api.get('/sessions'),
  getRecent: (limit = 5) => api.get(`/sessions/recent?limit=${limit}`),
  get: (id: string) => api.get(`/sessions/${id}`),
  create: (data: { session_type?: string; initial_mood?: number; model?: string }) =>
    api.post('/sessions', data),
  addMessage: (id: string, content: string) =>
    api.post(`/sessions/${id}/messages`, { content }),
  end: (id: string, duration: number) =>
    api.post(`/sessions/${id}/end`, { duration }),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

// Test API
export const testApi = {
  getModels: () => api.get('/test/ai/models'),
  testAI: (message: string, model: string) =>
    api.post('/test/ai', { message, model }),
};

// Health API
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;