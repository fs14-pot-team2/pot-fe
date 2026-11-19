"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

import MessageItem from "../MessageItem/MessageItem";
import type { Message } from "@/features/messages/types/message";

import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  otherNickname: string;
  otherProfileImageUrl: string | null;
  isLoading?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isNextPageError?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

interface ScrollSnapshot {
  height: number;
  top: number;
}

const DATE_TIME_ZONE = "Asia/Seoul";

function getDateKey(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DATE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: DATE_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export default function MessageList({
  messages,
  currentUserId,
  otherNickname,
  otherProfileImageUrl,
  isLoading = false,
  isError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  isNextPageError = false,
  onLoadMore,
  onRetry,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const previousFirstIdRef = useRef<string | null>(null);
  const previousLastIdRef = useRef<string | null>(null);

  const snapshotRef = useRef<ScrollSnapshot | null>(null);
  const wasNearBottomRef = useRef(true);

  // 메시지 목록 위쪽에 도달하면 이전 메시지 조회
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;

    if (!element) return;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

    wasNearBottomRef.current = distanceFromBottom < 160;

    if (
      !initializedRef.current ||
      !hasNextPage ||
      isFetchingNextPage ||
      isNextPageError ||
      isLoading ||
      isError ||
      element.scrollTop > 80
    ) {
      return;
    }

    // 이전 메시지 추가 후 기존 스크롤 위치 유지
    snapshotRef.current = {
      height: element.scrollHeight,
      top: element.scrollTop,
    };

    onLoadMore?.();
  }, [hasNextPage, isFetchingNextPage, isNextPageError, isLoading, isError, onLoadMore]);

  const firstId = messages[0]?.id ?? null;
  const lastId = messages[messages.length - 1]?.id ?? null;

  useLayoutEffect(() => {
    const element = scrollRef.current;

    if (!element || isLoading || isError) return;

    if (!initializedRef.current) {
      // 최초 진입 시 가장 최근 메시지로 이동
      element.scrollTop = element.scrollHeight;
      initializedRef.current = true;
    } else if (snapshotRef.current && previousFirstIdRef.current !== firstId) {
      // 이전 메시지가 추가되면 스크롤 위치 보존
      const { height, top } = snapshotRef.current;

      element.scrollTop = top + (element.scrollHeight - height);

      snapshotRef.current = null;
    } else if (
      previousLastIdRef.current !== lastId &&
      previousFirstIdRef.current === firstId &&
      wasNearBottomRef.current
    ) {
      // 최신 메시지가 추가되면 하단으로 이동
      element.scrollTop = element.scrollHeight;
    }

    previousFirstIdRef.current = firstId;
    previousLastIdRef.current = lastId;
  }, [firstId, lastId, isLoading, isError]);

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.feedback} role="status">
          쪽지를 불러오는 중이에요.
        </div>
      ) : isError ? (
        <div className={styles.feedback}>
          <p>쪽지를 불러오지 못했어요.</p>

          <button type="button" className={styles.retryButton} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className={styles.scrollArea}
          onScroll={handleScroll}
          role="log"
          aria-label={`${otherNickname}님과의 쪽지`}
          aria-live="off"
          tabIndex={0}
        >
          {isFetchingNextPage && (
            <p className={styles.loadingMore}>이전 쪽지를 불러오는 중이에요.</p>
          )}

          {/* 추가 페이지 오류: 기존 메시지 유지 */}
          {isNextPageError && !isFetchingNextPage && (
            <div className={styles.pageError}>
              <p>이전 쪽지를 불러오지 못했어요.</p>

              <button type="button" className={styles.retryButton} onClick={onRetry}>
                다시 시도
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className={styles.empty}>
              <p>아직 주고받은 쪽지가 없어요.</p>
              <p>첫 번째 쪽지를 보내보세요!</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {messages.map((message, index) => {
                const previousMessage = messages[index - 1];

                const showDate =
                  !previousMessage ||
                  getDateKey(previousMessage.createdAt) !== getDateKey(message.createdAt);

                return (
                  <li key={message.id} className={styles.messageGroup}>
                    {showDate && (
                      <div
                        className={styles.dateDivider}
                        aria-label={formatDate(message.createdAt)}
                      >
                        <span className={styles.dateText}>{formatDate(message.createdAt)}</span>
                      </div>
                    )}

                    <ul className={styles.messageItems}>
                      <MessageItem
                        message={message}
                        isMine={message.senderId === currentUserId}
                        otherNickname={otherNickname}
                        otherProfileImageUrl={otherProfileImageUrl}
                      />
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
