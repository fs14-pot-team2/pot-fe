"use client";

import { useMutation } from "@tanstack/react-query";
import { updateAccount, verifyPassword } from "../api/accountApi";
import { useAuth } from "@/lib/auth/AuthProvider";

export function useVerifyPasswordMutation() {
  return useMutation({
    mutationFn: verifyPassword,
  });
}

export function useUpdateAccountMutation() {
  const { retrySession } = useAuth();

  return useMutation({
    mutationFn: updateAccount,
    onSuccess: () => {
      retrySession();
    },
  });
}
