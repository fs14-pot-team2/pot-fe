import type { PartnerInfo, PartnerRegion, PartnerServiceType } from "@/types/partner";

export type SitterSort = "RATING_DESC" | "REVIEW_COUNT_DESC" | "CONFIRMED_QUOTE_COUNT_DESC";

export type SitterListParams = {
  page: number;
  keyword?: string;
  sort: SitterSort;
  regions?: PartnerRegion[];
  serviceTypes?: PartnerServiceType;
  gender?: "MALE" | "FEMALE";
};

export type SitterListResponse = {
  items: PartnerInfo[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
