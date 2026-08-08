// ============================================================
// ResumeForge — Auth Store (Zustand + Persist)
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserType } from "@/types/resume.types";

// --- State shape ---

interface AuthState {
  userType: UserType | null;
  onboardingCompleted: boolean;
}

// --- Actions ---

interface AuthActions {
  setUserType: (type: UserType) => void;
  setOnboardingCompleted: (val: boolean) => void;
}

// --- Store ---

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      userType: null,
      onboardingCompleted: false,

      // Actions
      setUserType: (type) => set({ userType: type }),
      setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),
    }),
    {
      name: "resumeforge-auth",
    }
  )
);
