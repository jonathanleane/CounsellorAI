import axios from 'axios';

// Check if we should use versioned API
const useVersionedApi = import.meta.env.VITE_USE_API_V1 !== 'false';
const apiVersion = useVersionedApi ? '/v1' : '';
const API_BASE = import.meta.env.VITE_API_URL || `/api${apiVersion}`;

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF cookies
});

// Log API version in development
if (import.meta.env.DEV) {
  console.log(`Using API: ${API_BASE}`);
}

// Store CSRF token
let csrfToken: string | null = null;

// Function to fetch CSRF token
async function fetchCsrfToken() {
  try {
    // CSRF token endpoint is always at /api/csrf-token (not versioned)
    const response = await axios.get('/api/csrf-token', { withCredentials: true });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Only add CSRF token for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    } else if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_VALIDATION_FAILED') {
      // CSRF token invalid, fetch new one and retry
      csrfToken = null;
      await fetchCsrfToken();
      
      // Retry the original request with new token
      const originalRequest = error.config;
      originalRequest.headers['x-csrf-token'] = csrfToken;
      return api(originalRequest);
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