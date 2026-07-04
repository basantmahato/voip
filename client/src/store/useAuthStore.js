import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { username, password });
          set({
            user: { _id: response.data._id, username: response.data.username },
            token: response.data.token,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error; // Re-throw to handle in UI if needed
        }
      },

      register: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', { username, password });
          set({
            user: { _id: response.data._id, username: response.data.username },
            token: response.data.token,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        // We will also disconnect socket here in later steps
      },
    }),
    {
      name: 'auth-storage', // saves to localStorage so user stays logged in
    }
  )
);

export default useAuthStore;
