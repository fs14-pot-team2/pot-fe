import { apiClient } from "@/lib/api/apiClient";
import type { SitterListParams, SitterListResponse } from "../types/sitter";

export async function getSitters(params: SitterListParams): Promise<SitterListResponse> {
  const { data } = await apiClient.get<SitterListResponse>("/sitters", {
    authMode: "optional",
    params: {
      page: params.page,
      pageSize: 8,
      keyword: params.keyword?.trim() || undefined,
      sort: params.sort,
      regions: params.regions?.length ? params.regions.join(",") : undefined,
      serviceTypes: params.serviceTypes,
      gender: params.gender,
    },
  });

  return data;
}
