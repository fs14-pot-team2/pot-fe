"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
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
};

export default function NotificationPanel({
  notifications,
  onClose,
  onNotificationClick,
}: NotificationPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const panelRef = useRef<HTMLElement>(null);

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

  return (
    <section
      ref={panelRef}
      className={styles.panel}
      role="dialog"
      aria-label="알림 목록"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>알림</h2>

        <button
          type="button"
          className={styles.closeButton}
          aria-label="알림 닫기"
          onClick={onClose}
        >
          <Image src="/icons/ic_close.svg" alt="" width={24} height={24} />
        </button>
      </div>

      {notifications.length === 0 ? (
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
        </ul>
      )}
    </section>
  );
}
