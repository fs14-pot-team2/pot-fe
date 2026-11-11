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

export type SitterDetailResponse = PartnerInfo & {
  designatedRequestId: string | null;
  designatedRequestStatus:
    | "AVAILABLE"
    | "NO_ACTIVE_REQUEST"
    | "ALREADY_DESIGNATED"
    | "LIMIT_EXCEEDED"
    | "ALREADY_SENT_QUOTE"
    | null;
};

export type SitterRequestGuideType = "login" | "noActiveRequest" | null;
