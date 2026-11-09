"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { getHistoryQuotes } from "@/features/quotes/owner/api/historyQuotesApi";

import type {
  HistoryFilterStatus,
  HistoryRequestStatus,
} from "@/features/quotes/owner/types/historyQuotes";

const HISTORY_LIMIT = 4;

export const historyQuoteKeys = {
  all: ["ownerQuotes", "history"] as const,
  list: (status: HistoryFilterStatus) => [...historyQuoteKeys.all, status] as const,
};

export function useHistoryQuotes(filterStatus: HistoryFilterStatus = "ALL") {
  const status: HistoryRequestStatus | undefined =
    filterStatus === "ALL" ? undefined : filterStatus;

  return useInfiniteQuery({
    queryKey: historyQuoteKeys.list(filterStatus),

    initialPageParam: null as string | null,

    queryFn: ({ pageParam }) =>
      getHistoryQuotes({
        cursor: pageParam ?? undefined,
        limit: HISTORY_LIMIT,
        status,
      }),

    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || !lastPage.nextCursor) {
        return undefined;
      }

      return lastPage.nextCursor;
    },

    retry: 1,
  });
}
