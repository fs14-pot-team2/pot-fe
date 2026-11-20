"use client";

import { useEffect, useRef } from "react";

import ConversationItem from "../ConversationItem/ConversationItem";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import Loading from "@/components/ui/Loading/Loading";

import type { Conversation } from "@/features/messages/types/message";

import styles from "./ConversationList.module.css";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isNextPageError?: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

export default function ConversationList({
  conversations,
  isLoading = false,
  isError = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  isNextPageError = false,
  onSelectConversation,
  onLoadMore,
  onRetry,
}: ConversationListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // 목록 하단 도달 시 다음 페이지 조회
  useEffect(() => {
    const root = listRef.current;

    if (!root || isLoading || isError || isNextPageError || !hasNextPage) {
      return;
    }

    const handleScroll = () => {
      if (isFetchingNextPage) return;

      const distanceFromBottom = root.scrollHeight - root.scrollTop - root.clientHeight;

      if (distanceFromBottom <= 80) {
        loadMoreRef.current?.();
      }
    };

    root.addEventListener("scroll", handleScroll);

    return () => {
      root.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading, isError, isNextPageError, hasNextPage, isFetchingNextPage]);

  // 최초 조회 로딩
  if (isLoading) {
    return (
      <div className={styles.feedback}>
        <Loading variant="content" message="대화방을 불러오는 중이에요." />
      </div>
    );
  }

  // 최초 조회 실패
  if (isError) {
    return (
      <div className={styles.feedback}>
        <p className={styles.errorText}>대화방 목록을 불러오지 못했어요.</p>

        <button type="button" className={styles.retryButton} onClick={onRetry}>
          다시 시도
        </button>
      </div>
    );
  }

  // 정상적으로 조회했지만 대화방이 없는 경우
  if (conversations.length === 0) {
    return (
      <div className={styles.feedback}>
        <EmptyState messages={["아직 주고받은 쪽지가 없어요.", "팟트너와 대화를 시작해보세요!"]} />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={styles.scrollArea}
      role="region"
      aria-label="대화방 목록"
      tabIndex={0}
    >
      <ul className={styles.list}>
        {conversations.map((conversation) => (
          <li key={conversation.conversationId} className={styles.item}>
            <ConversationItem
              nickname={conversation.otherUser.nickname}
              profileImageUrl={conversation.otherUser.profileImageUrl}
              hasUnreadMessage={conversation.hasUnreadMessage}
              onClick={() => onSelectConversation(conversation)}
            />
          </li>
        ))}
      </ul>

      {isFetchingNextPage && (
        <p className={styles.nextPageLoading}>대화방을 더 불러오는 중이에요.</p>
      )}

      {/* 추가 페이지 실패: 기존 목록 유지 */}
      {isNextPageError && !isFetchingNextPage && (
        <div className={styles.nextPageError}>
          <p>대화방을 더 불러오지 못했어요.</p>

          <button type="button" className={styles.retryButton} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
