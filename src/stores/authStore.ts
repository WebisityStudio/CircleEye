import { create } from 'zustand';
import type { UserProfile, AuthState } from '../types/user';

interface AuthStore extends AuthState {
  // Actions
  setLoading: (loading: boolean) => void;
  setUser: (user: UserProfile | null, accessToken: string | null) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  error: null,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setLoading: (isLoading) => set({ isLoading }),

  setUser: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      isLoading: false,
      error: null,
    }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  logout: () =>
    set({
      ...initialState,
      isLoading: false,
    }),
}));
