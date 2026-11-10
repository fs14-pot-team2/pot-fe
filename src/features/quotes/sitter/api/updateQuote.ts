import { apiClient } from "@/lib/api/apiClient";

export interface UpdateQuoteInput {
  price?: number;
  comment?: string;
}

export interface UpdateQuoteParams {
  quoteId: string;
  input: UpdateQuoteInput;
}

export interface UpdateQuoteResponse {
  id: string;
  careRequestId: string;
  sitterId: string;
  type: "GENERAL" | "DESIGNATED";
  price: number;
  comment: string;
  updatedAt: string;
}

export async function updateQuote({
  quoteId,
  input,
}: UpdateQuoteParams): Promise<UpdateQuoteResponse> {
  const { data } = await apiClient.patch<UpdateQuoteResponse>(`/quotes/${quoteId}`, input);

  return data;
}
