"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getSentQuotes } from "../api/getSentQuotes";
import { sitterQuoteKeys } from "../queryKeys";
import type { SentQuotesParams } from "../types/sentQuote";

export function useSentQuotes(params: SentQuotesParams) {
  return useQuery({
    queryKey: sitterQuoteKeys.sentList(params),
    queryFn: () => getSentQuotes(params),
    placeholderData: keepPreviousData,
  });
}
