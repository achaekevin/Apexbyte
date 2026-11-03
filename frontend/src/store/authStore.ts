import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loginTimestamp: number | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

// Maximum idle / active window for an admin session (2 hours)
export const ADMIN_SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;

/**
 * Role-aware hybrid storage engine:
 * 1. ADMIN and SUPER_ADMIN sessions are strictly stored in sessionStorage.
 *    Closing all terminals or browser windows immediately terminates the admin session.
 * 2. CUSTOMER sessions are kept in localStorage for shopping convenience (cart, orders, etc.).
 * 3. Any legacy or lingering admin tokens found in localStorage are automatically purged on load.
 */
const roleAwareStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;

    try {
      // Check sessionStorage first (active admin sessions)
      const sessionItem = window.sessionStorage.getItem(name);
      if (sessionItem) {
        // Validate it's parseable before returning
        try {
          JSON.parse(sessionItem);
          return sessionItem;
        } catch {
          window.sessionStorage.removeItem(name);
        }
      }

      // Check localStorage (customer sessions)
      const localItem = window.localStorage.getItem(name);
      if (localItem) {
        let parsed: any;
        try {
          parsed = JSON.parse(localItem);
        } catch {
          // Corrupted data — purge and start fresh
          window.localStorage.removeItem(name);
          return null;
        }

        const role = parsed?.state?.user?.role;

        // Security enforcement: If an ADMIN session was saved in localStorage from a previous session,
        // purge it immediately. Admin sessions must NEVER persist across closed sessions or terminals!
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
          window.localStorage.removeItem(name);
          return null;
        }

        return localItem;
      }
    } catch (err) {
      // Catastrophic storage failure — clear everything for this key to prevent repeat crashes
      console.warn('[AuthStore] Error reading storage, clearing corrupted state:', err);
      try {
        window.sessionStorage.removeItem(name);
        window.localStorage.removeItem(name);
      } catch { /* ignore */ }
    }

    return null;
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;

    try {
      const parsed = JSON.parse(value);
      const role = parsed?.state?.user?.role;

      if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        // Admin credentials strictly live in sessionStorage (destroyed on browser/terminal close)
        window.sessionStorage.setItem(name, value);
        window.localStorage.removeItem(name); // Purge from permanent storage
        return;
      }

      // Customers persist in localStorage
      window.localStorage.setItem(name, value);
      window.sessionStorage.removeItem(name);
    } catch {
      window.localStorage.setItem(name, value);
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(name);
      window.localStorage.removeItem(name);
    } catch (err) {
      console.warn('[AuthStore] Error removing storage item:', err);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loginTimestamp: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          loginTimestamp: Date.now(),
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () => {
        // Clear both storages upon explicit logout
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('auth-storage');
          window.localStorage.removeItem('auth-storage');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loginTimestamp: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => roleAwareStorage),
      version: 2, // Bumped from implicit 0 → 2 after roleAwareStorage + loginTimestamp changes
      migrate: (persistedState: any, version: number) => {
        // Version < 2: old schema before roleAwareStorage and loginTimestamp.
        // Discard stale tokens and force re-login to avoid hydration crashes.
        if (version < 2) {
          return {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            loginTimestamp: null,
          };
        }
        return persistedState as AuthState;
      },
    }
  )
);
