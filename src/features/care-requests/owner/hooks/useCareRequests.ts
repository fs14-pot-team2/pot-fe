"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelCareRequest,
  createCareRequest,
  createDesignatedRequest,
  getActiveCareRequest,
  getRejectedRequestReason,
  updateCareRequest,
} from "@/features/care-requests/owner/api/careRequestsApi";

import { careRequestKeys } from "@/features/care-requests/owner/queryKeys";
import { activeQuotesKeys } from "@/features/quotes/owner/hooks/useActiveQuotes";
import { ownerQuoteKeys } from "@/features/quotes/owner/queryKeys";
import { sitterKeys } from "@/features/sitters/queryKeys";

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

// 돌봄 요청 취소
export function useCancelCareRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelCareRequest,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: careRequestKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: activeQuotesKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ownerQuoteKeys.all,
        }),
      ]);
    },
  });
}

// 지정 요청 반려 사유 조회
export function useRejectedRequestReason(rejectedRequestId?: string | null) {
  return useQuery({
    queryKey: careRequestKeys.rejectedReason(rejectedRequestId ?? ""),
    queryFn: () => {
      if (!rejectedRequestId) {
        throw new Error("반려 요청 ID가 필요합니다.");
      }

      return getRejectedRequestReason(rejectedRequestId);
    },
    enabled: Boolean(rejectedRequestId),
    retry: false,
  });
}

// 팟트너 지정 요청 생성
export function useCreateDesignatedRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ careRequestId, sitterId }: { careRequestId: string; sitterId: string }) =>
      createDesignatedRequest(careRequestId, sitterId),

    onSuccess: async (_data, { sitterId }) => {
      await queryClient.invalidateQueries({
        queryKey: sitterKeys.detail(sitterId),
      });
    },
  });
}
