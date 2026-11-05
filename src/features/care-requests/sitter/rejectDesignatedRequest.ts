import { apiClient } from "@/lib/api/apiClient";

interface RejectDesignatedRequestResponse {
  id: string;
  designatedRequestId: string;
  reason: string;
  createdAt: string;
}

interface RejectDesignatedRequestParams {
  designatedRequestId: string;
  reason: string;
}

export async function rejectDesignatedRequest({
  designatedRequestId,
  reason,
}: RejectDesignatedRequestParams): Promise<RejectDesignatedRequestResponse> {
  const { data } = await apiClient.post<RejectDesignatedRequestResponse>(
    `/care-requests/designated-requests/${designatedRequestId}/reject`,
    { reason },
  );

  return data;
}
