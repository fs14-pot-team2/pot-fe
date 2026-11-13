export type ReviewServiceType = "SHORT_CARE" | "REGULAR_CARE";

export type ReviewQuoteType = "GENERAL" | "DESIGNATED";

// 리뷰 작성·수정 모달에서 사용하는 입력값
export interface ReviewFormValues {
  rating: number;
  content: string;
}

// 작성 가능한 리뷰 목록의 카드 데이터
export interface WritableReviewItem {
  careRequest: {
    id: string;
    serviceType: ReviewServiceType;
    endDate: string;
  };
  confirmedQuote: {
    id: string;
    type: ReviewQuoteType;
    price: number;
  };
  sitter: {
    id: string;
    nickname: string;
    profileImageUrl: string | null;
  };
}

// 리뷰 목록 공통 페이지네이션 응답
export interface PaginatedReviews<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type WritableReviewsResponse = PaginatedReviews<WritableReviewItem>;

// 리뷰 등록 성공 응답
export interface CreateReviewResponse {
  id: string;
  careRequestId: string;
  ownerId: string;
  sitterId: string;
  rating: number;
  content: string;
  createdAt: string;
}
