import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import  type { User } from '../types/entities';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user: User, accessToken: string, refreshToken: string) => {
        console.log('Login: Saving to store and localStorage', { user, hasToken: !!accessToken });
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        console.log('Logout: Clearing store and localStorage');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        console.log('Updating tokens in store');
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log('Rehydrating auth state from localStorage...');
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating auth state:', error);
          } else if (state) {
            console.log('Auth state rehydrated:', {
              isAuthenticated: state.isAuthenticated,
              hasUser: !!state.user,
              hasToken: !!state.accessToken,
            });
          } else {
            console.log('No auth state found in localStorage');
          }
        };
      },
    }
  )
);