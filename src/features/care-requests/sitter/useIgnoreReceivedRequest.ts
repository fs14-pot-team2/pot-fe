"use client";

import { useMutation } from "@tanstack/react-query";

import { ignoreReceivedRequest } from "./ignoreReceivedRequest";

export function useIgnoreReceivedRequest() {
  return useMutation({
    mutationFn: ignoreReceivedRequest,
  });
}
