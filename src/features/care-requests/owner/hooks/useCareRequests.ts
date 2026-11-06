"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCareRequest,
  getActiveCareRequest,
  updateCareRequest,
} from "@/features/care-requests/owner/api/careRequestsApi";

import { careRequestKeys } from "@/features/care-requests/owner/queryKeys";

// 활성 돌봄 요청 조회
export function useActiveCareRequest(enabled = true) {
  return useQuery({
    queryKey: careRequestKeys.active(),
    queryFn: getActiveCareRequest,
    enabled,
    retry: false,
  });
}

// 돌봄 요청 등록
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

// 돌봄 요청 수정
export function useUpdateCareRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCareRequest,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: careRequestKeys.all,
      });
    },
  });
}
