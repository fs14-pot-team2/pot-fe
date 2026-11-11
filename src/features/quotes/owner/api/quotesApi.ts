import { apiClient } from "@/lib/api/apiClient";
import type { QuoteDetailResponse } from "@/features/quotes/owner/types/quote";

// 견적 상세 조회
export async function getQuoteDetail(quoteId: string): Promise<QuoteDetailResponse> {
  const { data } = await apiClient.get<QuoteDetailResponse>(`/quotes/${quoteId}`);

  return data;
}

// 견적 확정 API 응답
export interface ConfirmQuoteResponse {
  quote: {
    id: string;
    careRequestId: string;
    sitterId: string;
    type: "GENERAL" | "DESIGNATED";
    price: number;
    comment: string;
  };
  careRequest: {
    id: string;
    status: "MATCHED";
    confirmedQuoteId: string;
    updatedAt: string;
  };
}

// 견적 확정
export async function confirmQuote(quoteId: string): Promise<ConfirmQuoteResponse> {
  const { data } = await apiClient.patch<ConfirmQuoteResponse>(`/quotes/${quoteId}/confirm`);

  return data;
}
