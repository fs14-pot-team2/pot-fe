import { apiClient } from "@/lib/api/apiClient";

import type {
  HistoryQuotesParams,
  HistoryQuotesResponse,
} from "@/features/quotes/owner/types/historyQuotes";

export async function getHistoryQuotes({
  cursor,
  limit = 4,
  status,
}: HistoryQuotesParams = {}): Promise<HistoryQuotesResponse> {
  const { data } = await apiClient.get<HistoryQuotesResponse>("/care-requests/me/history/quotes", {
    params: {
      ...(cursor ? { cursor } : {}),
      limit,
      ...(status ? { status } : {}),
    },
  });

  return data;
}
