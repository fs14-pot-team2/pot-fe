import { apiClient } from "@/lib/api/apiClient";

import type {
  ActiveCareRequestResponse,
  CareRequest,
  CreateCareRequestInput,
} from "@/features/care-requests/owner/types/careRequest";

export async function getActiveCareRequest(): Promise<ActiveCareRequestResponse> {
  const { data } = await apiClient.get<ActiveCareRequestResponse>("/care-requests/me/active");

  return data;
}

export async function createCareRequest(input: CreateCareRequestInput): Promise<CareRequest> {
  const { data } = await apiClient.post<CareRequest>("/care-requests", input);

  return data;
}
