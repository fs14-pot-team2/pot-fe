"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCareRequest,
  getActiveCareRequest,
} from "@/features/care-requests/owner/api/careRequestsApi";

import { careRequestKeys } from "@/features/care-requests/owner/queryKeys";

export function useActiveCareRequest(enabled = true) {
  return useQuery({
    queryKey: careRequestKeys.active(),
    queryFn: getActiveCareRequest,
    enabled,
    retry: false,
  });
}

export function useCreateCareRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCareRequest,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: careRequestKeys.all,
      });
    },
  });
}
