import { apiClient } from "@/lib/api/apiClient";

import type {
  ActiveCareRequestResponse,
  CareRequest,
  CreateCareRequestInput,
  UpdateCareRequestParams,
  UpdatedCareRequest,
} from "@/features/care-requests/owner/types/careRequest";

// 활성 돌봄 요청 조회
export async function getActiveCareRequest(): Promise<ActiveCareRequestResponse> {
  const { data } = await apiClient.get<ActiveCareRequestResponse>("/care-requests/me/active");

  return data;
}

// 돌봄 요청 등록
export async function createCareRequest(input: CreateCareRequestInput): Promise<CareRequest> {
  const { data } = await apiClient.post<CareRequest>("/care-requests", input);

  return data;
}

// 돌봄 요청 수정
export async function updateCareRequest({
  careRequestId,
  input,
}: UpdateCareRequestParams): Promise<UpdatedCareRequest> {
  const { data } = await apiClient.patch<UpdatedCareRequest>(
    `/care-requests/${careRequestId}`,
    input,
  );

  return data;
}
