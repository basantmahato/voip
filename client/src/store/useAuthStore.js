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

      joinAsGuest: async (displayName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/guest', { displayName });
          set({
            user: {
              _id: response.data._id,
              displayName: response.data.displayName,
            },
            token: response.data.token,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Could not join chat',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage', // saves to localStorage so user stays logged in
    }
  )
);

export default useAuthStore;
