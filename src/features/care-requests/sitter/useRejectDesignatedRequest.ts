"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rejectDesignatedRequest } from "./rejectDesignatedRequest";

export function useRejectDesignatedRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectDesignatedRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["care-requests", "received"],
      });
    },
  });
}
