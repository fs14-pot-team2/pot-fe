"use client";

import { refreshAccessToken, resetRefreshPromise } from "@/features/auth/api/authApi";
import type { AuthResponse, AuthUser } from "@/features/auth/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setAccessToken } from "./accessToken";
import { installAuthInterceptors } from "./authInterceptors";
import {
  AUTH_SESSION_CHANGE_KEY,
  getAuthSessionChange,
  publishAuthSessionChange,
} from "./authSessionSync";

type AuthStatus = "checking" | "authenticated" | "guest" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAccountVerified: boolean;
  sessionRevision: number;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
  logoutSession: () => void;
  retrySession: () => void;
  getSessionVersion: () => number;
  refreshSession: (version: number) => Promise<string | null>;
  completeAccountVerification: () => void;
  clearAccountVerification: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [retryCount, setRetryCount] = useState(0);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [sessionRevision, setSessionRevision] = useState(0);

  const sessionVersion = useRef(0);
  const currentUserRef = useRef<AuthUser | null>(null);
  const lastSessionChange = useRef<string | null>(null);

  const applySession = useCallback(
    (session: AuthResponse) => {
      sessionVersion.current += 1;
      setSessionRevision(sessionVersion.current);
      resetRefreshPromise();
      currentUserRef.current = session.user;
      setAccessToken(session.accessToken);
      queryClient.clear();
      setUser(session.user);
      setStatus("authenticated");
      setIsAccountVerified(false);
    },
    [queryClient],
  );

  const setSession = useCallback(
    (session: AuthResponse) => {
      applySession(session);
      lastSessionChange.current = publishAuthSessionChange();
    },
    [applySession],
  );

  const resetSession = useCallback(
    (nextStatus: "guest" | "checking") => {
      sessionVersion.current += 1;
      setSessionRevision(sessionVersion.current);
      resetRefreshPromise();
      currentUserRef.current = null;
      setAccessToken(null);
      queryClient.clear();
      setUser(null);
      setStatus(nextStatus);
      setIsAccountVerified(false);
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    resetSession("guest");
  }, [resetSession]);

  const logoutSession = useCallback(() => {
    clearSession();
    lastSessionChange.current = publishAuthSessionChange();
  }, [clearSession]);

  const getSessionVersion = useCallback(() => {
    return sessionVersion.current;
  }, []);

  const refreshSession = useCallback(
    async (version: number): Promise<string | null> => {
      const previousUser = currentUserRef.current;

      if (!previousUser || sessionVersion.current !== version) return null;

      const session = await refreshAccessToken();

      if (sessionVersion.current !== version) return null;

      if (previousUser.id !== session.user.id || previousUser.role !== session.user.role) {
        applySession(session);
        return null;
      }

      setAccessToken(session.accessToken);

      return session.accessToken;
    },
    [applySession],
  );

  const retrySession = useCallback(() => {
    setStatus("checking");
    setRetryCount((current) => current + 1);
  }, []);

  const syncSession = useCallback(() => {
    resetSession("checking");
    setRetryCount((current) => current + 1);
  }, [resetSession]);

  useEffect(() => {
    lastSessionChange.current = getAuthSessionChange();

    const checkSessionChange = () => {
      const latestChange = getAuthSessionChange();

      if (!latestChange || latestChange === lastSessionChange.current) {
        return;
      }

      lastSessionChange.current = latestChange;
      syncSession();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_CHANGE_KEY) {
        checkSessionChange();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        checkSessionChange();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionChange();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", checkSessionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", checkSessionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncSession]);

  const completeAccountVerification = useCallback(() => {
    setIsAccountVerified(true);
  }, []);

  const clearAccountVerification = useCallback(() => {
    setIsAccountVerified(false);
  }, []);

  useEffect(() => {
    return installAuthInterceptors({
      clearSession,
      getSessionVersion,
      refreshSession,
    });
  }, [clearSession, getSessionVersion, refreshSession]);

  useEffect(() => {
    let cancelled = false;
    const version = sessionVersion.current;

    const restoreSession = async () => {
      try {
        const session = await refreshAccessToken();

        if (cancelled || sessionVersion.current !== version) return;

        applySession(session);
      } catch (error) {
        if (cancelled || sessionVersion.current !== version) return;

        const code = axios.isAxiosError<{ code?: string }>(error)
          ? error.response?.data?.code
          : undefined;

        if (code === "REFRESH_TOKEN_INVALID" || code === "UNAUTHORIZED") {
          clearSession();
          return;
        }

        setStatus("error");
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession, applySession, retryCount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAccountVerified,
        sessionRevision,
        setSession,
        clearSession,
        logoutSession,
        retrySession,
        getSessionVersion,
        refreshSession,
        completeAccountVerification,
        clearAccountVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
