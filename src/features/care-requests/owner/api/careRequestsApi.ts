import { apiClient } from "@/lib/api/apiClient";

import type {
  ActiveCareRequestResponse,
  CareRequest,
  CreateCareRequestInput,
  UpdateCareRequestParams,
  UpdatedCareRequest,
} from "@/features/care-requests/owner/types/careRequest";

export type RejectedRequestReasonResponse = {
  reason: string;
};

export type CanceledCareRequestResponse = {
  id: string;
  status: "CANCELED";
  canceledAt: string;
};

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

// 돌봄 요청 취소
export async function cancelCareRequest(
  careRequestId: string,
): Promise<CanceledCareRequestResponse> {
  const { data } = await apiClient.patch<CanceledCareRequestResponse>(
    `/care-requests/${careRequestId}/cancel`,
  );

  return data;
}

// 지정 요청 반려 사유 조회
export async function getRejectedRequestReason(
  rejectedRequestId: string,
): Promise<RejectedRequestReasonResponse> {
  const { data } = await apiClient.get<RejectedRequestReasonResponse>(
    `/care-requests/rejected-requests/${encodeURIComponent(rejectedRequestId)}`,
  );

  return data;
}

export type CreateDesignatedRequestResponse = {
  id: string;
  careRequestId: string;
  sitterId: string;
  createdAt: string;
};

export async function createDesignatedRequest(careRequestId: string, sitterId: string) {
  const { data } = await apiClient.post<CreateDesignatedRequestResponse>(
    `/care-requests/${careRequestId}/designated-requests`,
    { sitterId },
  );

  return data;
}
