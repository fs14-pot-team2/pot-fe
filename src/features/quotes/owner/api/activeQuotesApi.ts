import { apiClient } from "@/lib/api/apiClient";

import type { ActiveQuotesResponse } from "../types/activeQuotes";

export async function getActiveQuotes(): Promise<ActiveQuotesResponse> {
  const { data } = await apiClient.get<ActiveQuotesResponse>("/care-requests/me/active/quotes");

  return data;
}
