export type CareServiceType = "SHORT_CARE" | "REGULAR_CARE";

export interface CareRequestAddress {
  zonecode: string;
  address: string;
  detailAddress: string | null;
  sido: string;
  sigungu: string | null;
  bname: string | null;
}

export interface CreateCareRequestInput extends CareRequestAddress {
  serviceType: CareServiceType;
  startDate: string;
  endDate: string;
}

export interface CareRequest extends CreateCareRequestInput {
  id: string;
  region: string;
  status: "OPEN" | "MATCHED" | "CANCELED" | "EXPIRED";
  createdAt: string;
}

// 활성 돌봄 요청 조회 응답
export interface ActiveCareRequestResponse {
  hasActiveCareRequest: boolean;
  careRequest: Omit<CareRequest, "region" | "status" | "createdAt"> | null;
}

// 돌봄 요청 수정 시 부분 수정도 허용
export type UpdateCareRequestInput = Partial<CreateCareRequestInput>;

// 수정 API 호출에 필요한 데이터
export interface UpdateCareRequestParams {
  careRequestId: string;
  input: UpdateCareRequestInput;
}

// 수정 API 응답
export type UpdatedCareRequest = Omit<CareRequest, "createdAt"> & {
  updatedAt: string;
};
