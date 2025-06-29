import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setToken: (authToken: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (userData, token) => set({ isAuthenticated: true, user: userData, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null }),
      setToken: (authToken) => set({ token: authToken }),
    }),
    {
      name: 'auth-storage', // localStorageのキー名
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useAuthStore; 