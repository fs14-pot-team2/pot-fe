import { apiClient } from "@/lib/api/apiClient";
import type {
  CreateReviewResponse,
  ReviewFormValues,
  WritableReviewsResponse,
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
