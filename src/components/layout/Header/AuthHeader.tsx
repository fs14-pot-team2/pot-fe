"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/Toast/ToastProvider";

import type { NotificationItem } from "@/components/common/NotificationPanel/NotificationPanel";

import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import AuthStatusFallback from "@/features/auth/components/AuthStatusFallback/AuthStatusFallback";

import {
  useNotifications,
  useReadNotification,
  useReadAllNotifications,
  useUnreadNotification,
} from "@/features/notifications/hooks/useNotifications";

import { getNotificationRoute } from "@/features/notifications/utils/getNotificationRoute";

import { useUnreadMessageStatus, messageKeys } from "@/features/messages/hooks/useMessages";

import { useMessagePanel } from "@/features/messages/context/MessagePanelProvider";

import { subscribeSse } from "@/lib/sse/sseSubscriptions";
import { useAuth } from "@/lib/auth/AuthProvider";

import Header from "./Header";

export default function AuthHeader() {
  const { user, status } = useAuth();

  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useLogoutMutation();
  const { showToast } = useToast();

  const { closePanel } = useMessagePanel();

  // 알림 목록 조회
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

  // 알림 전체 읽음 처리
  const { mutate: markAllNotificationsAsRead, isPending: isMarkingAllNotificationsAsRead } =
    useReadAllNotifications();

  // 알림 개별 읽음 처리
  const { mutateAsync: markNotificationAsRead, isPending: isReadingNotification } =
    useReadNotification();

  // 미확인 알림 상태
  const { data: unreadNotificationData } = useUnreadNotification();

  const hasUnreadNotification = unreadNotificationData?.hasUnreadNotification ?? false;

  // 미확인 쪽지 상태
  const { data: unreadMessageData } = useUnreadMessageStatus();

  const hasUnreadMessage = unreadMessageData?.hasUnreadMessage ?? false;

  // 공통 SSE 연결 재사용
  // 새 쪽지 이벤트 수신 시 관련 React Query 캐시 갱신
  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const unsubscribe = subscribeSse("message.created", () => {
      void queryClient.invalidateQueries({
        queryKey: messageKeys.all,
      });
    });

    return unsubscribe;
  }, [status, queryClient]);

  // 알림 목록 데이터 가공
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

  // 알림 목록 추가 불러오기
  const handleNotificationLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  };

  // 알림 목록 재조회
  const handleNotificationRetry = () => {
    void refetchNotifications();
  };

  // 알림 클릭
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!user || isReadingNotification) {
      return false;
    }

    const route = getNotificationRoute(notification.type, user.role);

    if (!route) {
      showToast({
        message: "이동할 페이지를 찾지 못했습니다.",
      });

      return false;
    }

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }

      router.push(route);

      return true;
    } catch {
      showToast({
        message: "알림을 읽음 처리하지 못했습니다.",
      });

      return false;
    }
  };

  // 알림 전체 읽음 처리
  const handleMarkAllNotificationsAsRead = () => {
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

  // 로그아웃
  const handleLogout = () => {
    if (logoutMutation.isPending) {
      return;
    }

    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        closePanel();
      },
      onError: () => {
        showToast({
          message: "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        });
      },
    });
  };

  // 인증 상태 확인 중 또는 오류
  if (status === "checking" || status === "error") {
    return <AuthStatusFallback status={status} />;
  }

  const isLoggedIn = status === "authenticated" && user !== null;

  return (
    <Header
      isLoggedIn={isLoggedIn}
      userRole={user?.role}
      nickname={user?.nickname}
      notifications={notifications}
      isNotificationLoading={isNotificationLoading}
      hasUnreadNotification={hasUnreadNotification}
      hasUnreadMessage={hasUnreadMessage}
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
