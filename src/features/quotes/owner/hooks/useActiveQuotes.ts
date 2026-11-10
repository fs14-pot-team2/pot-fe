"use client";

import { useQuery } from "@tanstack/react-query";

import { getActiveQuotes } from "../api/activeQuotesApi";

export const activeQuotesKeys = {
  all: ["ownerActiveQuotes"] as const,
  detail: () => [...activeQuotesKeys.all, "detail"] as const,
};

export function useActiveQuotes() {
  return useQuery({
    queryKey: activeQuotesKeys.detail(),
    queryFn: getActiveQuotes,
    retry: false,
  });
}
