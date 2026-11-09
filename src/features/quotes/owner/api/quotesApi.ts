import { apiClient } from "@/lib/api/apiClient";

import type { QuoteDetailResponse } from "@/features/quotes/owner/types/quote";

export async function getQuoteDetail(quoteId: string): Promise<QuoteDetailResponse> {
  const { data } = await apiClient.get<QuoteDetailResponse>(`/quotes/${quoteId}`);

  return data;
}
