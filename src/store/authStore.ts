import { create } from 'zustand';
import type { SignInResponse } from '../types/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  needSignUp: boolean;
  isLoading: boolean;

  // Actions
  login: (response: SignInResponse) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  needSignUp: false,
  isLoading: true,

  login: (response: SignInResponse) => {
    const { accessToken, refreshToken, needSignUp } = response;
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
      needSignUp,
      isLoading: false,
    });
  },

  logout: () => {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      needSignUp: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  initialize: () => {
    // Check for existing tokens on app load
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
