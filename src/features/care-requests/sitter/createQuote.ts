import { apiClient } from "@/lib/api/apiClient";

export interface CreateQuoteParams {
  careRequestId: string;
  price: number;
  comment: string;
}

export interface CreateQuoteResponse {
  id: string;
  careRequestId: string;
  sitterId: string;
  type: "GENERAL" | "DESIGNATED";
  price: number;
  comment: string;
  createdAt: string;
}

export async function createQuote({
  careRequestId,
  price,
  comment,
}: CreateQuoteParams): Promise<CreateQuoteResponse> {
  const { data } = await apiClient.post<CreateQuoteResponse>(
    `/care-requests/${careRequestId}/quotes`,
    {
      price,
      comment,
    },
  );

  return data;
}
