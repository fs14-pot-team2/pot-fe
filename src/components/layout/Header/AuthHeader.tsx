"use client";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useAuth } from "@/lib/auth/AuthProvider";
import Header from "./Header";
import AuthStatusFallback from "@/features/auth/components/AuthStatusFallback/AuthStatusFallback";

import {
  useNotifications,
  useReadNotification,
  useReadAllNotifications,
  useUnreadNotification,
} from "@/features/notifications/hooks/useNotifications";

import { getNotificationRoute } from "@/features/notifications/utils/getNotificationRoute";

import type { NotificationItem } from "@/components/common/NotificationPanel/NotificationPanel";

export default function AuthHeader() {
  const { user, status } = useAuth();
  const router = useRouter();
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

  const { mutate: markAllNotificationsAsRead, isPending: isMarkingAllNotificationsAsRead } =
    useReadAllNotifications();

  const { mutate: markNotificationAsRead, isPending: isReadingNotification } =
    useReadNotification();

  const { data: unreadNotificationData } = useUnreadNotification();

  const notifications = useMemo<NotificationItem[]>(() => {
    const notificationMap = new Map<string, NotificationItem>();

    notificationData?.pages.forEach((page) => {
      page.items.forEach((notification) => {
        notificationMap.set(notification.id, {
          id: notification.id,
          type: notification.type,
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

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!user || isReadingNotification) return;

    const route = getNotificationRoute(notification.type, user.role);

    if (!route) {
      showToast({
        message: "이동할 페이지를 찾지 못했습니다.",
      });
      return;
    }

    const moveToNotificationPage = () => {
      router.push(route);
    };

    if (notification.isRead) {
      moveToNotificationPage();
      return;
    }

    markNotificationAsRead(notification.id, {
      onSuccess: moveToNotificationPage,
      onError: () => {
        showToast({
          message: "알림을 읽음 처리하지 못했습니다.",
        });
      },
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    const hasUnreadNotification = notifications.some((notification) => !notification.isRead);

    if (isMarkingAllNotificationsAsRead || !hasUnreadNotification) {
      return;
    }

    markAllNotificationsAsRead(undefined, {
      onError: () => {
        showToast({
          message: "알림을 모두 읽음 처리하지 못했습니다.",
        });
      },
    });
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
      onNotificationClick={handleNotificationClick}
      isMarkingAllNotificationsAsRead={isMarkingAllNotificationsAsRead}
      onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      hasNotificationError={isNotificationError && notifications.length === 0}
      hasNextNotificationError={isFetchNextPageError}
      onNotificationRetry={handleNotificationRetry}
      onLogout={handleLogout}
    />
  );
}
