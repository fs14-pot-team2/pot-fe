import { apiClient } from "@/lib/api/apiClient";
import type {
  CreateReviewResponse,
  ReviewFormValues,
  WritableReviewsResponse,
  WrittenReviewsResponse,
} from "../types/review";

export async function getWritableReviews(page: number): Promise<WritableReviewsResponse> {
  const { data } = await apiClient.get<WritableReviewsResponse>("/owners/me/reviews/writable", {
    params: {
      page,
      pageSize: 8,
    },
  });

  return data;
}

export async function getWrittenReviews(page: number): Promise<WrittenReviewsResponse> {
  const { data } = await apiClient.get<WrittenReviewsResponse>("/owners/me/reviews", {
    params: {
      page,
      pageSize: 8,
    },
  });

  return data;
}

export async function createReview(
  careRequestId: string,
  input: ReviewFormValues,
): Promise<CreateReviewResponse> {
  const { data } = await apiClient.post<CreateReviewResponse>(
    `/care-requests/${careRequestId}/review`,
    input,
  );

  return data;
}

export async function updateReview(reviewId: string, input: ReviewFormValues): Promise<void> {
  await apiClient.patch(`/reviews/${reviewId}`, input);
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}`);
}
