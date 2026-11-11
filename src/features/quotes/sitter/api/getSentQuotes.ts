import { apiClient } from "@/lib/api/apiClient";

import type { SentQuotesParams, SentQuotesResponse } from "../types/sentQuote";

export async function getSentQuotes({
  page,
  pageSize = 8,
  confirmedOnly = false,
}: SentQuotesParams): Promise<SentQuotesResponse> {
  const { data } = await apiClient.get<SentQuotesResponse>("/quotes/me/sent", {
    params: {
      page,
      pageSize,
      confirmedOnly: confirmedOnly ? true : undefined,
    },
  });

  return data;
}
