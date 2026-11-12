"use client";

import { useQuery } from "@tanstack/react-query";
import { getSitterDetail } from "../api/sittersApi";
import { sitterKeys } from "../queryKeys";

export function useSitterDetail(sitterId: string) {
  return useQuery({
    queryKey: sitterKeys.detail(sitterId),
    queryFn: () => getSitterDetail(sitterId),
    enabled: Boolean(sitterId),
    retry: false,
  });
}
