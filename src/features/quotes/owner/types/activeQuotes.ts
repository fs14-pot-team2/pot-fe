import type { PartnerServiceType } from "@/types/partner";

export type ActiveQuoteCareRequest = {
  id: string;
  createdAt: string;
  serviceType: PartnerServiceType;
  startDate: string;
  endDate: string;
  sido: string;
  sigungu: string | null;
  bname: string | null;
};

export type ActiveQuoteSitter = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  gender: "MALE" | "FEMALE";
  shortIntroduction: string;
  averageRating: number;
  reviewCount: number;
  confirmedQuoteCount: number;
};

export type ActiveQuote = {
  id: string;
  designatedRequestId: string | null;
  price: number;
  createdAt: string;
  sitter: ActiveQuoteSitter;
};

export type ActiveRejectedRequest = {
  rejectedRequestId: string;
  designatedRequestId: string;
  createdAt: string;
  sitter: ActiveQuoteSitter;
};

export type ActiveQuotesResponse = {
  careRequest: ActiveQuoteCareRequest;
  quotes: ActiveQuote[];
  rejectedRequests: ActiveRejectedRequest[];
};
