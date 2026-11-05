import { apiClient } from "@/lib/api/apiClient";

import type { ReceivedRequestsParams, ReceivedRequestsResponse } from "@/types/receivedRequest";

export type GetReceivedRequestsParams = Omit<ReceivedRequestsParams, "region">;

export async function getReceivedRequests({
  page,
  pageSize,
  serviceTypes,
  designatedOnly,
  keyword,
  sort,
}: GetReceivedRequestsParams): Promise<ReceivedRequestsResponse> {
  const { data } = await apiClient.get<ReceivedRequestsResponse>("/care-requests/received", {
    params: {
      page,
      pageSize,
      serviceTypes: serviceTypes.length > 0 ? serviceTypes.join(",") : undefined,
      designatedOnly,
      keyword: keyword || undefined,
      sort,
    },
  });

  return data;
}
