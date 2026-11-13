"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Loading from "@/components/ui/Loading/Loading";
import { formatRelativeTime } from "@/utils/dateFormat";
import styles from "./NotificationPanel.module.css";

export type NotificationItem = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
};

type NotificationPanelProps = {
  notifications: NotificationItem[];
  onClose: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  isLoading?: boolean;
  isMarkingAllAsRead?: boolean;
  onMarkAllAsRead?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  hasError?: boolean;
  hasNextPageError?: boolean;
  onRetry?: () => void;
};

export default function NotificationPanel({
  notifications,
  onClose,
  onNotificationClick,
  isLoading = false,
  isMarkingAllAsRead = false,
  onMarkAllAsRead,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  hasError = false,
  hasNextPageError = false,
  onRetry,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasUnreadNotification = notifications.some((notification) => !notification.isRead);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const buttons = panelRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])");

    if (!buttons?.length) return;

    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    const isNearBottom = scrollHeight - scrollTop - clientHeight <= 40;

    if (!isNearBottom || !hasNextPage || isFetchingNextPage) {
      return;
    }

    onLoadMore?.();
  };

  return (
    <section
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-label="알림 목록"
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>알림</h2>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.markAllButton}
            disabled={isLoading || isMarkingAllAsRead || !hasUnreadNotification || !onMarkAllAsRead}
            onClick={onMarkAllAsRead}
          >
            {isMarkingAllAsRead ? "처리 중..." : "모두 읽음"}
          </button>

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            aria-label="알림 닫기"
            onClick={onClose}
          >
            <Image src="/icons/ic_close.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loading
          variant="content"
          message="알림 목록을 불러오는 중이에요."
          className={styles.loading}
        />
      ) : hasError ? (
        <div className={styles.error}>
          <p>알림을 불러오지 못했어요.</p>

          <button type="button" className={styles.retryButton} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <p className={styles.emptyMessage}>새로운 알림이 없어요.</p>
      ) : (
        <ul className={styles.list}>
          {notifications.map((notification) => (
            <li key={notification.id} className={styles.item}>
              <button
                type="button"
                className={styles.itemButton}
                onClick={() => onNotificationClick?.(notification)}
              >
                <span className={styles.content}>{notification.content}</span>
                <span className={styles.meta}>
                  <time dateTime={notification.createdAt}>
                    {formatRelativeTime(notification.createdAt)}
                  </time>
                  {!notification.isRead && (
                    <span className={styles.unreadDot} aria-label="읽지 않음" />
                  )}
                </span>
              </button>
            </li>
          ))}

          {isFetchingNextPage && (
            <li className={styles.nextPageLoading}>알림을 더 불러오는 중...</li>
          )}

          {hasNextPageError && !isFetchingNextPage && (
            <li className={styles.nextPageError}>
              <p>알림을 더 불러오지 못했어요.</p>

              <button type="button" className={styles.nextPageRetryButton} onClick={onLoadMore}>
                다시 시도
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
