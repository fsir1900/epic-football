import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  decrementFreeAnalyses: () => void;
  upgradeToPro: () => void;
}

// Mock users storage
const USERS_KEY = 'footballpro_users';

function getUsers(): Record<string, User & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, User & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const users = getUsers();
        const userEntry = Object.values(users).find(
          (u) => u.email === email && u.password === password
        );
        if (userEntry) {
          const { password: _, ...user } = userEntry;
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      register: async (username: string, email: string, password: string) => {
        const users = getUsers();
        if (Object.values(users).find((u) => u.email === email)) {
          return false; // already exists
        }
        const id = Date.now().toString();
        const newUser: User & { password: string } = {
          id,
          username,
          email,
          isPro: false,
          freeAnalysesUsed: 0,
          freeAnalysesLimit: 2,
          password,
        };
        users[id] = newUser;
        saveUsers(users);
        const { password: _, ...user } = newUser;
        set({ user, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      decrementFreeAnalyses: () => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, freeAnalysesUsed: user.freeAnalysesUsed + 1 };
        set({ user: updated });
        // persist to users storage
        const users = getUsers();
        if (users[user.id]) {
          users[user.id] = { ...users[user.id], freeAnalysesUsed: updated.freeAnalysesUsed };
          saveUsers(users);
        }
      },

      upgradeToPro: () => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, isPro: true };
        set({ user: updated });
        const users = getUsers();
        if (users[user.id]) {
          users[user.id] = { ...users[user.id], isPro: true };
          saveUsers(users);
        }
      },
    }),
    { name: 'footballpro_auth' }
  )
);
