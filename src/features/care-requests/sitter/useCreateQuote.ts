"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createQuote } from "./createQuote";

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["care-requests", "received"],
      });
    },
  });
}
