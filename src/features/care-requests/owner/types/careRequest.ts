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

export interface ActiveCareRequestResponse {
  hasActiveCareRequest: boolean;
  careRequest: Omit<CareRequest, "region" | "status" | "createdAt"> | null;
}
