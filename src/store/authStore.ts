import { create } from 'zustand';
import type { Role, SessionUser } from '@/types/auth';

type AuthState = {
  user: SessionUser | null;
  hydrated: boolean;
  setUser: (user: SessionUser | null) => void;
  setHydrated: () => void;
  hasRole: (role: Role) => boolean;
};

const storageKey = 'leaveflow.session';

function loadSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.setItem(storageKey, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(storageKey);
      }
    }

    set({ user });
  },
  setHydrated: () => {
    if (!get().hydrated) {
      set({ user: loadSessionUser(), hydrated: true });
    }
  },
  hasRole: (role) => get().user?.role === role,
}));
