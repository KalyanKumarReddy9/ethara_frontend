import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (name, email, password, role = 'member') => {
        set({ isLoading: true });
        try {
          const response = await authService.register({ name, email, password, role });
          const { token, user } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({ user, token, isAuthenticated: true });
            } catch {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
