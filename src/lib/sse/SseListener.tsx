"use client";

import { notificationKeys } from "@/features/notifications/queryKeys";
import { activeQuotesKeys } from "@/features/quotes/owner/hooks/useActiveQuotes";
import { sitterQuoteKeys } from "@/features/quotes/sitter/queryKeys";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectSse } from "./sseClient";
import { publishSse } from "./sseSubscriptions";

export default function SseListener() {
  const { status, user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;
  const role = user?.role;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SSE_ENABLED !== "true") return;
    if (status !== "authenticated" || !userId) return;

    const invalidateRelevantQueries = () => {
      // 공통 알림 목록 및 미확인 알림 갱신
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });

      // 팟오너: 요청한 견적 및 지정 요청 반려 현황
      if (role === "OWNER") {
        void queryClient.invalidateQueries({
          queryKey: activeQuotesKeys.detail(),
        });
      }

      // 팟트너: 보낸 견적 및 받은 요청 목록
      if (role === "SITTER") {
        void queryClient.invalidateQueries({
          queryKey: sitterQuoteKeys.sent(),
        });

        void queryClient.invalidateQueries({
          queryKey: ["care-requests", "received"],
        });
      }
    };

    const disconnect = connectSse(
      (event) => {
        if (event.type === "notification.created") {
          invalidateRelevantQueries();
        }

        publishSse(event);
      },
      {
        // 재연결 중 놓친 이벤트가 있을 수 있으므로 다시 조회한다.
        onReconnect: invalidateRelevantQueries,
      },
    );

    // 다른 탭이나 앱에서 돌아왔을 때 데이터 갱신
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidateRelevantQueries();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      disconnect();
    };
  }, [status, userId, role, queryClient]);

  return null;
}
