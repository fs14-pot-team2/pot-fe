export type QuoteDetail = {
  id: string;
  price: number;
  comment: string;
  createdAt: string;
};

export type QuoteDetailCareRequest = {
  id: string;
  status: "OPEN" | "MATCHED" | "CANCELED" | "EXPIRED";
  confirmedQuoteId: string | null;
  createdAt: string;
  serviceType: "SHORT_CARE" | "REGULAR_CARE";
  startDate: string;
  endDate: string;
  sido: string;
  sigungu: string | null;
  bname: string | null;
  zonecode: string | null;
  address: string | null;
  detailAddress: string | null;
};

export type QuoteDetailOwner = {
  nickname: string;
};

export type QuoteDetailSitter = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  gender: "MALE" | "FEMALE";
  shortIntroduction: string;
  averageRating: number;
  reviewCount: number;
  confirmedQuoteCount: number;
};

export type QuoteDetailResponse = {
  quote: QuoteDetail;
  designatedRequestId: string | null;
  careRequest: QuoteDetailCareRequest;
  owner: QuoteDetailOwner;
  sitter: QuoteDetailSitter;
};
