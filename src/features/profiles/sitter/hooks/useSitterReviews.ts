"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getSitterReviews } from "../api/sitterReviewApi";

type UseSitterReviewsParams = {
  sitterId?: string;
  page: number;
  pageSize?: number;
};

export function useSitterReviews({ sitterId, page, pageSize = 8 }: UseSitterReviewsParams) {
  return useQuery({
    queryKey: ["sitters", sitterId, "reviews", page, pageSize],

    queryFn: () => {
      if (!sitterId) {
        throw new Error("리뷰를 조회하려면 팟트너 ID가 필요합니다.");
      }

      return getSitterReviews({
        sitterId,
        page,
        pageSize,
      });
    },

    enabled: Boolean(sitterId),
    placeholderData: keepPreviousData,
    retry: false,
  });
}
