"use client";

import { messageKeys } from "@/features/messages/hooks/useMessages";
import { notificationKeys } from "@/features/notifications/queryKeys";
import { activeQuotesKeys } from "@/features/quotes/owner/hooks/useActiveQuotes";
import { sitterQuoteKeys } from "@/features/quotes/sitter/queryKeys";

import { useAuth } from "@/lib/auth/AuthProvider";
import { getAccessToken } from "@/lib/auth/accessToken";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { connectSse } from "./sseClient";
import { publishSse } from "./sseSubscriptions";

export default function SseListener() {
  const { status, user, clearSession } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;
  const role = user?.role;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SSE_ENABLED !== "true") {
      return;
    }

    if (status !== "authenticated" || !userId) {
      return;
    }

    // 기존 알림 및 역할별 목록 데이터 갱신
    const invalidateRelevantQueries = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });

      if (role === "OWNER") {
        void queryClient.invalidateQueries({
          queryKey: activeQuotesKeys.detail(),
        });
      }

      if (role === "SITTER") {
        void queryClient.invalidateQueries({
          queryKey: sitterQuoteKeys.sent(),
        });

        void queryClient.invalidateQueries({
          queryKey: ["care-requests", "received"],
        });
      }
    };

    // 쪽지 관련 전체 캐시 갱신
    const invalidateMessageQueries = () => {
      void queryClient.invalidateQueries({
        queryKey: messageKeys.all,
      });
    };

    // SSE 재연결 또는 탭 복귀 시 놓친 데이터 갱신
    const invalidateAfterReconnect = () => {
      invalidateRelevantQueries();
      invalidateMessageQueries();
    };

    const disconnect = connectSse(
      (event) => {
        if (event.type === "notification.created") {
          invalidateRelevantQueries();
        }

        // 기존 기능별 SSE 구독자에게 이벤트 전달
        publishSse(event);
      },
      {
        // 연결 중단 동안 놓친 알림 및 쪽지 재조회
        onReconnect: invalidateAfterReconnect,

        // 기존 SSE 인증 오류 처리 유지
        onAuthError: (error) => {
          if (
            error.shouldClearSession &&
            error.tokenAtFailure &&
            getAccessToken() === error.tokenAtFailure
          ) {
            clearSession();
          }
        },
      },
    );

    // 다른 탭이나 앱에서 돌아왔을 때 데이터 갱신
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidateAfterReconnect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      disconnect();
    };
  }, [status, userId, role, queryClient, clearSession]);

  return null;
}
