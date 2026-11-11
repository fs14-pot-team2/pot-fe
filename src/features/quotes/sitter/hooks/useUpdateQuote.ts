"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateQuote } from "../api/updateQuote";

export function useUpdateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuote,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["quotes"],
      });
    },
  });
}
