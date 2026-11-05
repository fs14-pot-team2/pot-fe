"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ignoreReceivedRequest } from "./ignoreReceivedRequest";

export function useIgnoreReceivedRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ignoreReceivedRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["care-requests", "received"],
      });
    },
  });
}
