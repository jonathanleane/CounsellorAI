import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token: string, user: User) => {
        // Set token in API client
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        set({
          token,
          user,
          isAuthenticated: true
        });
      },

      logout: () => {
        // Remove token from API client
        delete api.defaults.headers.common['Authorization'];
        
        set({
          token: null,
          user: null,
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        const state = get();
        
        if (!state.token) {
          return false;
        }

        try {
          // Set token in case it's not set yet
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          
          // Verify token is still valid
          const response = await api.get('/auth/me');
          
          set({
            user: response.data.user,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          // Token is invalid
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
);

// Initialize auth on app load
const token = localStorage.getItem('auth-storage');
if (token) {
  try {
    const authData = JSON.parse(token);
    if (authData.state?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authData.state.token}`;
    }
  } catch (error) {
    console.error('Error parsing auth storage:', error);
  }
}