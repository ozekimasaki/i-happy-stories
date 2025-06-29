import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      setSession: (session) =>
        set({
          session,
          isAuthenticated: !!session,
        }),
      logout: () => set({ session: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 