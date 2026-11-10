"use client";

import { useQuery } from "@tanstack/react-query";
import { getSitters } from "../api/sittersApi";
import { sitterKeys } from "../queryKeys";
import type { SitterListParams } from "../types/sitter";

export function useSitters(params: SitterListParams, enabled = true) {
  return useQuery({
    queryKey: sitterKeys.list(params),
    queryFn: () => getSitters(params),
    enabled,
    retry: false,
  });
}
