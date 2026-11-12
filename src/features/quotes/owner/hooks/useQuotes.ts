"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { confirmQuote, getQuoteDetail } from "@/features/quotes/owner/api/quotesApi";

import { ownerQuoteKeys } from "@/features/quotes/owner/queryKeys";
import { activeQuotesKeys } from "@/features/quotes/owner/hooks/useActiveQuotes";
import { careRequestKeys } from "@/features/care-requests/owner/queryKeys";

export function useQuoteDetail(quoteId: string, enabled = true) {
  return useQuery({
    queryKey: ownerQuoteKeys.detail(quoteId),
    queryFn: () => getQuoteDetail(quoteId),
    enabled: enabled && /^\d+$/.test(quoteId) && BigInt(quoteId) > 0n,
    retry: false,
  });
}

export function useConfirmQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmQuote,

    onSuccess: () => {
      // 확정 API 성공 후 캐시 무효화
      // 재조회가 완료될 때까지 화면 이동을 막지 않음
      void queryClient.invalidateQueries({
        queryKey: activeQuotesKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: ownerQuoteKeys.all,
      });

      void queryClient.invalidateQueries({
        queryKey: careRequestKeys.all,
      });
    },
  });
}
