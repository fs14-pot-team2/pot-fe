import { apiClient } from "@/lib/api/apiClient";

import type { RejectedRequestsParams, RejectedRequestsResponse } from "@/types/rejectedRequest";

export async function getRejectedRequests({
  page,
  pageSize,
}: RejectedRequestsParams): Promise<RejectedRequestsResponse> {
  const { data } = await apiClient.get<RejectedRequestsResponse>("/care-requests/me/rejected", {
    params: {
      page,
      pageSize,
    },
  });

  return data;
}
