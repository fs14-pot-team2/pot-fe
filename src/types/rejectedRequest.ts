import type { ServiceType } from "@/types/receivedRequest";

export interface RejectedRequestItem {
  rejectedRequest: {
    id: string;
    createdAt: string;
  };
  designatedRequestId: string;
  careRequest: {
    id: string;
    serviceType: ServiceType;
    startDate: string;
    endDate: string;
    sido: string;
    sigungu: string;
    bname: string | null;
    owner: {
      nickname: string;
    };
  };
}

export interface RejectedRequestsResponse {
  items: RejectedRequestItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface RejectedRequestsParams {
  page: number;
  pageSize: number;
}
