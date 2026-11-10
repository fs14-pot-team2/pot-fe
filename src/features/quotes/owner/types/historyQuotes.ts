export type HistoryRequestStatus = "MATCHED" | "EXPIRED";

export type HistoryFilterStatus = "ALL" | HistoryRequestStatus;

export interface HistorySitter {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  gender: "MALE" | "FEMALE";
  shortIntroduction: string;
  averageRating: number;
  reviewCount: number;
  confirmedQuoteCount: number;
}

export interface HistoryQuote {
  id: string;
  designatedRequestId: string | null;
  price: number;
  createdAt: string;
  sitter: HistorySitter;
}

export interface HistoryRejectedRequest {
  rejectedRequestId: string;
  designatedRequestId: string;
  createdAt: string;
  sitter: HistorySitter;
}

export interface HistoryCareRequest {
  id: string;
  status: HistoryRequestStatus;
  confirmedQuoteId: string | null;
  createdAt: string;
  serviceType: "SHORT_CARE" | "REGULAR_CARE";
  startDate: string;
  endDate: string;
  sido: string;
  sigungu: string | null;
  bname: string | null;
}

export interface HistoryQuoteItem {
  careRequest: HistoryCareRequest;
  quotes: HistoryQuote[];
  rejectedRequests: HistoryRejectedRequest[];
}

export interface HistoryQuotesResponse {
  items: HistoryQuoteItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface HistoryQuotesParams {
  cursor?: string;
  limit?: number;
  status?: HistoryRequestStatus;
}
