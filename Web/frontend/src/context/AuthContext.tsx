"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { AdminUser, AuthState } from "@/types";

// ═══════════════════════════════════════════════════
//  ProctorLens Auth Context
//  Mock implementation — replace with Axios calls later
//  Future: POST /api/auth/login  |  POST /api/auth/logout
// ═══════════════════════════════════════════════════

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Mock credentials (isolated — easy to replace) ──
const MOCK_ADMIN: AdminUser = {
  id: "u001",
  name: "Syed Abdullah Kazmi",
  email: "admin@comsats.edu.pk",
  employeeId: "ADM-001",
  department: "Administration",
  designation: "System Administrator",
  role: "Administrator",
  lastLogin: new Date().toISOString(),
};

const MOCK_CREDENTIALS = {
  username: "admin@comsats.edu.pk",
  password: "Admin@123",
};

const SESSION_KEY = "proctorLens_admin_session";

// ── Auth Provider ──────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const user = JSON.parse(stored) as AdminUser;
        setState({ isAuthenticated: true, user, isLoading: false });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(
    async (
      username: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 900));

      if (
        username.toLowerCase() === MOCK_CREDENTIALS.username.toLowerCase() &&
        password === MOCK_CREDENTIALS.password
      ) {
        const user = { ...MOCK_ADMIN, lastLogin: new Date().toISOString() };
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        setState({ isAuthenticated: true, user, isLoading: false });
        return { success: true };
      }

      return {
        success: false,
        error: "Invalid username or password. Please try again.",
      };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setState({ isAuthenticated: false, user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ───────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
