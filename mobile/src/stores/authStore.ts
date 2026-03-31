// ============================================
// PromptVault Mobile - Auth Store (stub)
// PIN feature removed — always unlocked
// ============================================

import { create } from 'zustand';

interface AuthState {
  isUnlocked: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isUnlocked: true,
  hydrated: true,
  hydrate: async () => {
    set({ hydrated: true, isUnlocked: true });
  },
}));
