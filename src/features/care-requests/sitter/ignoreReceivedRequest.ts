import { apiClient } from "@/lib/api/apiClient";

interface IgnoreReceivedRequestResponse {
  id: string;
  careRequestId: string;
  createdAt: string;
}

export async function ignoreReceivedRequest(
  careRequestId: string,
): Promise<IgnoreReceivedRequestResponse> {
  const { data } = await apiClient.post<IgnoreReceivedRequestResponse>(
    `/care-requests/${careRequestId}/ignore`,
  );

  return data;
}
