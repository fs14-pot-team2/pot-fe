import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api/apiClient";

import type { ReceivedRequestsParams, ReceivedRequestsResponse } from "@/types/receivedRequest";

export type GetReceivedRequestsParams = ReceivedRequestsParams;
export function isInvalidRegionError(error: unknown): boolean {
  return (
    isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 400 &&
    error.response?.data?.code === "INVALID_REGION"
  );
}

export async function getReceivedRequests({
  page,
  pageSize,
  serviceTypes,
  designatedOnly,
  regions,
  keyword,
  sort,
}: GetReceivedRequestsParams): Promise<ReceivedRequestsResponse> {
  const { data } = await apiClient.get<ReceivedRequestsResponse>("/care-requests/received", {
    params: {
      page,
      pageSize,
      serviceTypes: serviceTypes.length > 0 ? serviceTypes.join(",") : undefined,
      designatedOnly,
      regions: regions.length > 0 ? regions.join(",") : undefined,
      keyword: keyword || undefined,
      sort,
    },
  });

  return data;
}
