"use client";

import { getCurrentUser, refreshAccessToken } from "@/features/auth/api/authApi";
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

type AuthStatus = "checking" | "authenticated" | "guest" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAccountVerified: boolean;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
  retrySession: () => void;
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

  const sessionVersion = useRef(0);

  const setSession = useCallback(
    (session: AuthResponse) => {
      sessionVersion.current += 1;
      setAccessToken(session.accessToken);
      queryClient.clear();
      setUser(session.user);
      setStatus("authenticated");
      setIsAccountVerified(false);
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    sessionVersion.current += 1;
    setAccessToken(null);
    queryClient.clear();
    setUser(null);
    setStatus("guest");
    setIsAccountVerified(false);
  }, [queryClient]);

  const retrySession = useCallback(() => {
    setStatus("checking");
    setRetryCount((current) => current + 1);
  }, []);

  const completeAccountVerification = useCallback(() => {
    setIsAccountVerified(true);
  }, []);

  const clearAccountVerification = useCallback(() => {
    setIsAccountVerified(false);
  }, []);

  useEffect(() => {
    return installAuthInterceptors({
      clearSession,
      getSessionVersion: () => sessionVersion.current,
    });
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;
    const version = sessionVersion.current;

    const restoreSession = async () => {
      try {
        const { accessToken } = await refreshAccessToken();

        if (cancelled || sessionVersion.current !== version) return;

        setAccessToken(accessToken);

        const currentUser = await getCurrentUser();

        if (cancelled || sessionVersion.current !== version) return;

        setSession({ accessToken, user: currentUser });
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
  }, [clearSession, setSession, retryCount]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAccountVerified,
        setSession,
        clearSession,
        retrySession,
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
