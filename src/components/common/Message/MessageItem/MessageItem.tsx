"use client";

import Image from "next/image";
import { useId, useLayoutEffect, useRef, useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const textRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textId = useId();

  const formattedTime = formatMessageTime(message.createdAt);

  // 기본 5줄에서 실제 텍스트가 잘리는지 확인
  useLayoutEffect(() => {
    if (isExpanded) return;

    const textElement = textRef.current;
    const contentElement = contentRef.current;

    if (!textElement || !contentElement) return;

    const measureOverflow = () => {
      const isOverflowing = textElement.scrollHeight > textElement.clientHeight + 1;

      setHasOverflow(isOverflowing);
    };

    measureOverflow();

    // 패널 및 화면 너비가 바뀌면 줄 수를 다시 계산
    const resizeObserver = new ResizeObserver(measureOverflow);

    resizeObserver.observe(contentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [message.content, isExpanded]);

  const handleToggleExpand = () => {
    setIsExpanded((previous) => !previous);
  };

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

      <div className={styles.messageContent} ref={contentRef}>
        {!isMine && <span className={styles.nickname}>{otherNickname}</span>}

        <div className={styles.messageRow}>
          <div className={styles.bubble}>
            <p
              id={textId}
              ref={textRef}
              className={`${styles.messageText} ${isExpanded ? styles.expanded : ""}`}
            >
              {message.content}
            </p>

            {hasOverflow && (
              <button
                type="button"
                className={styles.expandButton}
                onClick={handleToggleExpand}
                aria-expanded={isExpanded}
                aria-controls={textId}
              >
                {isExpanded ? "접기" : "더보기"}
              </button>
            )}
          </div>

          <time className={styles.time} dateTime={message.createdAt}>
            {formattedTime}
          </time>
        </div>
      </div>
    </li>
  );
}
