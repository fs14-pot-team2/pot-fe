"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotification,
  readNotification,
  readAllNotifications,
} from "../api/notificationApi";
import { notificationKeys } from "../queryKeys";

import { useAuth } from "@/lib/auth/AuthProvider";
import type { NotificationListResponse, UnreadNotificationResponse } from "../types/notification";

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

export function useReadNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readNotification,

    onSuccess: (readNotificationData) => {
      queryClient.setQueriesData<InfiniteData<NotificationListResponse>>(
        { queryKey: notificationKeys.lists() },
        (previousData) => {
          if (!previousData) return previousData;

          return {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) =>
                notification.id === readNotificationData.id
                  ? {
                      ...notification,
                      readAt: readNotificationData.readAt,
                    }
                  : notification,
              ),
            })),
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(),
      });
    },
  });
}

export function useReadAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllNotifications,

    onSuccess: ({ updatedCount }) => {
      if (updatedCount > 0) {
        const temporaryReadAt = new Date().toISOString();

        queryClient.setQueriesData<InfiniteData<NotificationListResponse>>(
          { queryKey: notificationKeys.lists() },
          (previousData) => {
            if (!previousData) return previousData;

            return {
              ...previousData,
              pages: previousData.pages.map((page) => ({
                ...page,
                items: page.items.map((notification) => ({
                  ...notification,
                  readAt: notification.readAt ?? temporaryReadAt,
                })),
              })),
            };
          },
        );
      }

      queryClient.setQueryData<UnreadNotificationResponse>(notificationKeys.unread(), {
        hasUnreadNotification: false,
      });

      void queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
    },
  });
}
