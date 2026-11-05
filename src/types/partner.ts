export type PartnerServiceType = "SHORT_CARE" | "REGULAR_CARE";

export type PartnerRegion =
  | "SEOUL"
  | "GYEONGGI"
  | "INCHEON"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "SEJONG"
  | "DAEJEON"
  | "JEONBUK"
  | "JEONNAM"
  | "GWANGJU"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "DAEGU"
  | "ULSAN"
  | "BUSAN"
  | "JEJU";

export type PartnerInfo = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  gender: "MALE" | "FEMALE";
  shortIntroduction: string;
  description: string | null;
  serviceTypes: PartnerServiceType[];
  serviceRegions: PartnerRegion[];
  averageRating: number;
  reviewCount: number;
  confirmedQuoteCount: number;
};

export type PartnerReviewSummary = {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: Record<"1" | "2" | "3" | "4" | "5", number>;
};

export type PartnerReviewItem = {
  review: {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
  };
  owner: {
    id: string;
    nickname: string;
  };
};

export type PartnerReviewsData = {
  summary: PartnerReviewSummary;
  items: PartnerReviewItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
