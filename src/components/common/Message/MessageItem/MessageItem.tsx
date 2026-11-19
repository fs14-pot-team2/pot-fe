import Image from "next/image";

import type { Message } from "@/features/messages/types/message";

import styles from "./MessageItem.module.css";

interface MessageItemProps {
  message: Message;
  isMine: boolean;
  otherNickname: string;
  otherProfileImageUrl: string | null;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(date);
}

export default function MessageItem({
  message,
  isMine,
  otherNickname,
  otherProfileImageUrl,
}: MessageItemProps) {
  const formattedTime = formatMessageTime(message.createdAt);

  return (
    <li className={`${styles.item} ${isMine ? styles.sent : styles.received}`}>
      {!isMine && (
        <div className={styles.avatar}>
          <Image
            src={otherProfileImageUrl || "/icons/no_img.svg"}
            alt=""
            fill
            sizes="40px"
            className={styles.avatarImage}
          />
        </div>
      )}

      <div className={styles.messageContent}>
        {!isMine && <span className={styles.nickname}>{otherNickname}</span>}

        <div className={styles.messageRow}>
          <p className={styles.bubble}>{message.content}</p>

          <time className={styles.time} dateTime={message.createdAt}>
            {formattedTime}
          </time>
        </div>
      </div>
    </li>
  );
}
