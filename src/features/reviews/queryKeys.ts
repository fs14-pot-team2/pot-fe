export const ownerReviewKeys = {
  all: ["ownerReviews"] as const,

  writable: () => [...ownerReviewKeys.all, "writable"] as const,
  writablePage: (page: number) => [...ownerReviewKeys.writable(), page] as const,

  written: () => [...ownerReviewKeys.all, "written"] as const,
  writtenPage: (page: number) => [...ownerReviewKeys.written(), page] as const,
};
