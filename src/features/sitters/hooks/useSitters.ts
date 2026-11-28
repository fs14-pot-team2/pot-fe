"use client";

import { hashKey, useQuery } from "@tanstack/react-query";
import { getSitters } from "../api/sittersApi";
import { sitterKeys } from "../queryKeys";
import type { SitterListParams } from "../types/sitter";

export function useSitters(params: SitterListParams, enabled = true) {
  return useQuery({
    queryKey: sitterKeys.list(params),
    queryFn: () => getSitters(params),
    enabled,
    retry: false,
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[2];

      if (!previousParams || previousParams.page === params.page) {
        return undefined;
      }

      const previousConditionsKey = hashKey(sitterKeys.list({ ...previousParams, page: 1 }));

      const currentConditionsKey = hashKey(sitterKeys.list({ ...params, page: 1 }));

      return previousConditionsKey === currentConditionsKey ? previousData : undefined;
    },
  });
}
