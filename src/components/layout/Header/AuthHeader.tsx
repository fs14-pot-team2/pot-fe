"use client";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useMemo } from "react";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useAuth } from "@/lib/auth/AuthProvider";
import Header from "./Header";
import AuthStatusFallback from "@/features/auth/components/AuthStatusFallback/AuthStatusFallback";

import {
  useNotifications,
  useUnreadNotification,
} from "@/features/notifications/hooks/useNotifications";

import type { NotificationItem } from "@/components/common/NotificationPanel/NotificationPanel";

export default function AuthHeader() {
  const { user, status } = useAuth();
  const logoutMutation = useLogoutMutation();
  const { showToast } = useToast();
  const {
    data: notificationData,
    isPending: isNotificationLoading,
    isError: isNotificationError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch: refetchNotifications,
  } = useNotifications();

  const { data: unreadNotificationData } = useUnreadNotification();

  const notifications = useMemo<NotificationItem[]>(() => {
    const notificationMap = new Map<string, NotificationItem>();

    notificationData?.pages.forEach((page) => {
      page.items.forEach((notification) => {
        notificationMap.set(notification.id, {
          id: notification.id,
          content: notification.message,
          createdAt: notification.createdAt,
          isRead: notification.readAt !== null,
        });
      });
    });

    return Array.from(notificationMap.values());
  }, [notificationData]);

  const handleNotificationLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;

    void fetchNextPage();
  };

  const handleNotificationRetry = () => {
    void refetchNotifications();
  };

  const handleLogout = () => {
    if (logoutMutation.isPending) return;

    logoutMutation.mutate(undefined, {
      onError: () => {
        showToast({
          message: "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        });
      },
    });
  };

  if (status === "checking" || status === "error") {
    return <AuthStatusFallback status={status} />;
  }

  return (
    <Header
      isLoggedIn={status === "authenticated" && user !== null}
      userRole={user?.role}
      nickname={user?.nickname}
      notifications={notifications}
      isNotificationLoading={isNotificationLoading}
      hasUnreadNotification={unreadNotificationData?.hasUnreadNotification ?? false}
      hasNextNotificationPage={hasNextPage}
      isFetchingNextNotificationPage={isFetchingNextPage}
      onNotificationLoadMore={handleNotificationLoadMore}
      hasNotificationError={isNotificationError && notifications.length === 0}
      hasNextNotificationError={isFetchNextPageError}
      onNotificationRetry={handleNotificationRetry}
      onLogout={handleLogout}
    />
  );
}
