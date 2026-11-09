"use client";

import { useQuery } from "@tanstack/react-query";

import { getQuoteDetail } from "@/features/quotes/owner/api/quotesApi";
import { ownerQuoteKeys } from "@/features/quotes/owner/queryKeys";

export function useQuoteDetail(quoteId: string, enabled = true) {
  return useQuery({
    queryKey: ownerQuoteKeys.detail(quoteId),
    queryFn: () => getQuoteDetail(quoteId),
    enabled: enabled && /^\d+$/.test(quoteId) && BigInt(quoteId) > 0n,
    retry: false,
  });
}
