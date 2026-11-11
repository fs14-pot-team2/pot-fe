"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getRejectedRequests } from "./getRejectedRequests";
import type { RejectedRequestsParams } from "@/types/rejectedRequest";

const rejectedRequestKeys = {
  all: ["care-requests", "sitter", "rejected"] as const,

  list: (params: RejectedRequestsParams) => [...rejectedRequestKeys.all, params] as const,
};

export function useRejectedRequests(params: RejectedRequestsParams, enabled = true) {
  return useQuery({
    queryKey: rejectedRequestKeys.list(params),
    queryFn: () => getRejectedRequests(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}
