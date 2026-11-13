"use client";

import { sitterKeys } from "@/features/sitters/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, getWritableReviews } from "../api/reviewsApi";
import { ownerReviewKeys } from "../queryKeys";
import type { ReviewFormValues } from "../types/review";

export function useWritableReviews(page: number) {
  return useQuery({
    queryKey: ownerReviewKeys.writablePage(page),
    queryFn: () => getWritableReviews(page),
    retry: false,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ careRequestId, input }: { careRequestId: string; input: ReviewFormValues }) =>
      createReview(careRequestId, input),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ownerReviewKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: sitterKeys.all,
      });
    },
  });
}
