"use client";

import Image from "next/image";

import styles from "./ConversationItem.module.css";

interface ConversationItemProps {
  nickname: string;
  profileImageUrl: string | null;
  hasUnreadMessage: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  nickname,
  profileImageUrl,
  hasUnreadMessage,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      type="button"
      className={styles.container}
      onClick={onClick}
      aria-label={`${nickname}님과의 대화 열기${hasUnreadMessage ? ", 읽지 않은 쪽지 있음" : ""}`}
    >
      <div className={styles.profileImage}>
        {profileImageUrl ? (
          <Image src={profileImageUrl} alt="" fill sizes="48px" className={styles.image} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            {nickname.charAt(0)}
          </span>
        )}
      </div>

      <span className={styles.nickname}>{nickname}</span>

      {hasUnreadMessage && <span className={styles.unreadDot} aria-hidden="true" />}
    </button>
  );
}
