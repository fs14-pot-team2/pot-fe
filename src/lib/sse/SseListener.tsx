"use client";

import { notificationKeys } from "@/features/notifications/queryKeys";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { connectSse } from "./sseClient";

export default function SseListener() {
  const { status, user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SSE_ENABLED !== "true") return;
    if (status !== "authenticated" || !userId) return;

    const invalidateNotificationQueries = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    };

    const disconnect = connectSse(
      (event) => {
        if (event.type === "notification.created") {
          invalidateNotificationQueries();
        }
      },
      {
        // 재연결 중 놓친 알림이 있을 수 있으므로 다시 조회한다.
        onReconnect: invalidateNotificationQueries,
      },
    );

    // 다른 탭이나 앱에서 돌아왔을 때 알림 데이터를 다시 조회한다.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        invalidateNotificationQueries();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      disconnect();
    };
  }, [status, userId, queryClient]);

  return null;
}
