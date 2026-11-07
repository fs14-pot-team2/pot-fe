import { apiClient } from "@/lib/api/apiClient";
import type { PartnerReviewsData } from "@/types/partner";

export type GetSitterReviewsParams = {
  sitterId: string;
  page: number;
  pageSize?: number;
};

export async function getSitterReviews({
  sitterId,
  page,
  pageSize = 8,
}: GetSitterReviewsParams): Promise<PartnerReviewsData> {
  const { data } = await apiClient.get<PartnerReviewsData>(
    `/sitters/${encodeURIComponent(sitterId)}/reviews`,
    {
      params: {
        page,
        pageSize,
      },
    },
  );

  return data;
}
