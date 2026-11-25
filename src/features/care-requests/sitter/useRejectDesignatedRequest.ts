"use client";

import { useMutation } from "@tanstack/react-query";

import { rejectDesignatedRequest } from "./rejectDesignatedRequest";

export function useRejectDesignatedRequest() {
  return useMutation({
    mutationFn: rejectDesignatedRequest,
  });
}
