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
  isChecking: boolean;
  hasChecked: boolean;
  authCheckPromise: Promise<boolean> | null;
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
      isChecking: false,
      hasChecked: false,
      authCheckPromise: null,

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
          isAuthenticated: false,
          hasChecked: true,
          authCheckPromise: null
        });
        
        // Trigger storage event to sync logout across tabs
        // This will be picked up by the listener we'll add
        localStorage.setItem('auth-logout', Date.now().toString());
      },

      checkAuth: async () => {
        const state = get();
        
        // If already checking, return the existing promise
        if (state.authCheckPromise) {
          console.log('Auth check already in progress, returning existing promise...');
          return state.authCheckPromise;
        }
        
        // If already checked and no token, return false
        if (state.hasChecked && !state.token) {
          return false;
        }
        
        if (!state.token) {
          set({ hasChecked: true });
          return false;
        }

        // Create and store the promise
        const authCheckPromise = (async () => {
          set({ isChecking: true });
          
          try {
            console.log('Checking auth status...');
            // Set token in case it's not set yet
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
            
            // Verify token is still valid
            const response = await api.get('/auth/me');
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isChecking: false,
              hasChecked: true,
              authCheckPromise: null
            });
            
            console.log('Auth check successful');
            return true;
          } catch (error) {
            console.log('Auth check failed:', error);
            // Token is invalid
            get().logout();
            set({ isChecking: false, authCheckPromise: null });
            return false;
          }
        })();
        
        set({ authCheckPromise });
        return authCheckPromise;
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

// Listen for logout events from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'auth-logout' && e.newValue) {
    // Another tab logged out, sync this tab
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      console.log('Logout detected from another tab, syncing...');
      store.logout();
    }
  } else if (e.key === 'auth-storage') {
    // Auth storage changed (login/logout)
    const store = useAuthStore.getState();
    if (!e.newValue && store.isAuthenticated) {
      // Storage was cleared, logout this tab
      console.log('Auth storage cleared, logging out...');
      store.logout();
    } else if (e.newValue && !store.isAuthenticated) {
      // New auth data, check if valid
      store.checkAuth();
    }
  }
});