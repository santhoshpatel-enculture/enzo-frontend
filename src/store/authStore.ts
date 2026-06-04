import { create } from 'zustand';
import { logoutApi, setAuthToken } from '../services/api';
import type { UserProfile } from '../services/api';
import { clearSession, readSession, writeSession } from '../lib/authSession';

const bootSession = readSession();
if (bootSession?.token) {
  setAuthToken(bootSession.token);
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: bootSession?.user ?? null,
  token: bootSession?.token ?? null,
  isAuthenticated: Boolean(bootSession?.token),

  setAuth: (user, token) => {
    setAuthToken(token);
    writeSession({ user, token });
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    void logoutApi();
    setAuthToken(null);
    clearSession();
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));
