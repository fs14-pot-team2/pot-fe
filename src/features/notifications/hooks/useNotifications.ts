"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getNotifications, getUnreadNotification } from "../api/notificationApi";
import { notificationKeys } from "../queryKeys";

import { useAuth } from "@/lib/auth/AuthProvider";

const DEFAULT_NOTIFICATION_LIMIT = 8;

export function useNotifications(limit = DEFAULT_NOTIFICATION_LIMIT) {
  const { status } = useAuth();

  return useInfiniteQuery({
    queryKey: notificationKeys.list(limit),

    initialPageParam: null as string | null,

    queryFn: ({ pageParam }) =>
      getNotifications({
        cursor: pageParam ?? undefined,
        limit,
      }),

    getNextPageParam: (lastPage) => {
      if (!lastPage.hasNext || !lastPage.nextCursor) {
        return undefined;
      }

      return lastPage.nextCursor;
    },

    enabled: status === "authenticated",

    retry: 1,
  });
}

export function useUnreadNotification() {
  const { status } = useAuth();

  return useQuery({
    queryKey: notificationKeys.unread(),

    queryFn: getUnreadNotification,

    enabled: status === "authenticated",

    retry: 1,
  });
}
