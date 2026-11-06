"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getReceivedRequests, type GetReceivedRequestsParams } from "./getReceivedRequests";

export function useReceivedRequests(params: GetReceivedRequestsParams) {
  return useQuery({
    queryKey: ["care-requests", "received", params],
    queryFn: () => getReceivedRequests(params),
    placeholderData: keepPreviousData, // 다음페이지 불러오는동안 이전 카드목록 유지
  });
}
