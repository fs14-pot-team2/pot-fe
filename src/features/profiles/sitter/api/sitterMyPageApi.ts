import { apiClient } from "@/lib/api/apiClient";
import type { PartnerInfo } from "@/types/partner";

export async function getSitterMyPage(): Promise<PartnerInfo> {
  const { data } = await apiClient.get<PartnerInfo>("/sitters/me");

  return data;
}
