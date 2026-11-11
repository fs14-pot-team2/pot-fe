"use client";

import { useQuery } from "@tanstack/react-query";

import { getQuoteDetail } from "@/features/quotes/owner/api/quotesApi";

import { sitterQuoteKeys } from "../queryKeys";

export function useSitterQuoteDetail(quoteId: string) {
  const isValidQuoteId = /^\d+$/.test(quoteId) && BigInt(quoteId) > 0n;

  return useQuery({
    queryKey: sitterQuoteKeys.detail(quoteId),
    queryFn: () => getQuoteDetail(quoteId),
    enabled: isValidQuoteId,
    retry: false,
  });
}
