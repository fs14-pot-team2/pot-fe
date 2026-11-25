"use client";

import { useMutation } from "@tanstack/react-query";

import { createQuote } from "./createQuote";

export function useCreateQuote() {
  return useMutation({
    mutationFn: createQuote,
  });
}
