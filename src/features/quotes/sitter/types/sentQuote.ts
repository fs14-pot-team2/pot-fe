import type { ServiceType } from "@/types/receivedRequest";

export type SentQuoteRequestStatus = "OPEN" | "MATCHED" | "EXPIRED";

export interface SentQuoteItem {
  quote: {
    id: string;
    price: number;
    comment: string;
    createdAt: string;
  };
  designatedRequestId: string | null;
  careRequest: {
    id: string;
    status: SentQuoteRequestStatus;
    serviceType: ServiceType;
    startDate: string;
    endDate: string;
    sido: string;
    sigungu: string | null;
    bname: string | null;
    confirmedQuoteId: string | null;
  };
  owner: {
    nickname: string;
  };
}

export interface SentQuotesResponse {
  items: SentQuoteItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SentQuotesParams {
  page: number;
  pageSize: number;
  confirmedOnly?: boolean;
}
