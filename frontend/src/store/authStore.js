import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../lib/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      setAuthUser: (userData, token = null) => {
        set({ user: userData });
        if (token) {
          localStorage.setItem('access_token', token);
        }
      },
      logout: async () => {
        try {
          await axiosInstance.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null });
          localStorage.removeItem('access_token');
        }
      },
      checkAuth: async () => {
        try {
          console.log('Checking authentication...');
          const response = await axiosInstance.get('/auth/me');
          console.log('Auth response:', response.data);
          if (response.data.success) {
            set({ user: response.data.user });
            console.log('User authenticated:', response.data.user);
            return true;
          }
        } catch (error) {
          console.error('Auth check error:', error.response?.status, error.response?.data);
          set({ user: null });
        }
        return false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;
