"use client";

import { sitterKeys } from "@/features/sitters/queryKeys";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReview,
  deleteReview,
  getWritableReviews,
  getWrittenReviews,
  updateReview,
} from "../api/reviewsApi";
import { ownerReviewKeys } from "../queryKeys";
import type { ReviewFormValues } from "../types/review";
import { getReviewErrorCode, getReviewErrorPolicy } from "../utils/reviewErrors";

export function useWritableReviews(page: number) {
  return useQuery({
    queryKey: ownerReviewKeys.writablePage(page),
    queryFn: () => getWritableReviews(page),
    retry: false,
  });
}

export function useWrittenReviews(page: number) {
  return useQuery({
    queryKey: ownerReviewKeys.writtenPage(page),
    queryFn: () => getWrittenReviews(page),
    retry: false,
  });
}

function useReviewMutationOptions() {
  const queryClient = useQueryClient();
  const { getSessionVersion } = useAuth();

  const invalidateReviewQueries = (sessionVersion: number | undefined, includeSitter: boolean) => {
    if (sessionVersion !== getSessionVersion()) return;

    void queryClient.invalidateQueries({
      queryKey: ownerReviewKeys.all,
    });

    if (includeSitter) {
      void queryClient.invalidateQueries({
        queryKey: sitterKeys.all,
      });
    }
  };

  return {
    onMutate: () => getSessionVersion(),

    onSuccess: (_data: unknown, _variables: unknown, sessionVersion: number | undefined) => {
      invalidateReviewQueries(sessionVersion, true);
    },

    onError: (error: unknown, _variables: unknown, sessionVersion: number | undefined) => {
      const { refresh } = getReviewErrorPolicy(getReviewErrorCode(error));

      if (refresh === "none") return;

      invalidateReviewQueries(sessionVersion, refresh === "owner-and-sitter");
    },
  };
}

export function useCreateReview() {
  const mutationOptions = useReviewMutationOptions();

  return useMutation({
    mutationFn: ({ careRequestId, input }: { careRequestId: string; input: ReviewFormValues }) =>
      createReview(careRequestId, input),

    ...mutationOptions,
  });
}

export function useUpdateReview() {
  const mutationOptions = useReviewMutationOptions();

  return useMutation({
    mutationFn: ({ reviewId, input }: { reviewId: string; input: ReviewFormValues }) =>
      updateReview(reviewId, input),

    ...mutationOptions,
  });
}

export function useDeleteReview() {
  const mutationOptions = useReviewMutationOptions();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),

    ...mutationOptions,
  });
}
