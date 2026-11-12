import { apiClient } from "@/lib/api/apiClient";
import type { SitterDetailResponse, SitterListParams, SitterListResponse } from "../types/sitter";

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

export async function getSitterDetail(sitterId: string): Promise<SitterDetailResponse> {
  const { data } = await apiClient.get<SitterDetailResponse>(`/sitters/${sitterId}`, {
    authMode: "optional",
  });

  if (!data || typeof data.id !== "string") {
    throw new Error("팟트너 상세 응답에 필요한 정보가 없습니다.");
  }

  return data;
}
