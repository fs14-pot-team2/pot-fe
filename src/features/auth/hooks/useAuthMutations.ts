"use client";

import { login, logout, signup } from "@/features/auth/api/authApi";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: signup,
  });
}

export function useLogoutMutation() {
  const { clearSession } = useAuth();

  return useMutation({
    mutationFn: logout,
    onSuccess: clearSession,
  });
}
