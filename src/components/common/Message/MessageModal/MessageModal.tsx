"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "@/lib/auth/AuthProvider";

import ConversationList from "../ConversationList/ConversationList";
import MessageList from "../MessageList/MessageList";
import MessageComposer from "../MessageComposer/MessageComposer";

import {
  useConversations,
  useMarkMessagesAsRead,
  useMessages,
  useSendMessage,
} from "@/features/messages/hooks/useMessages";

import type { Conversation, Message } from "@/features/messages/types/message";

import styles from "./MessageModal.module.css";

export interface MessageUser {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

interface SelectedConversation {
  conversationId: string | null;
  otherUser: MessageUser;
  source: "list" | "external";
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser?: MessageUser | null;
}

export default function MessageModal({ isOpen, onClose, initialUser = null }: MessageModalProps) {
  const { user, status } = useAuth();

  // GNB 진입: 목록
  // 견적 카드/상세 진입: 해당 팟트너 대화
  const [selectedConversation, setSelectedConversation] = useState<SelectedConversation | null>(
    () =>
      initialUser
        ? {
            conversationId: null,
            otherUser: initialUser,
            source: "external",
          }
        : null,
  );

  const [visibilityVersion, setVisibilityVersion] = useState(0);

  const readAttemptRef = useRef<string | null>(null);
  const sendLockRef = useRef(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const isConversationList = selectedConversation === null;

  // 실제 대화방 목록 API
  const conversationsQuery = useConversations(isOpen && isConversationList);

  // 실제 메시지 조회 API
  const messagesQuery = useMessages(
    selectedConversation?.otherUser.id ?? null,
    isOpen && !isConversationList,
  );

  // 실제 발송 및 읽음 처리 API
  const sendMutation = useSendMessage();
  const readMutation = useMarkMessagesAsRead();

  // 모바일에서 패널 오픈 시 닫기 버튼에 포커스
  useEffect(() => {
    if (!isOpen) return;

    const isMobile = window.matchMedia("(max-width: 540px)").matches;

    if (isMobile) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Escape 닫기 및 브라우저 활성화 확인
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const handleVisibilityChange = () => {
      setVisibilityVersion((previous) => previous + 1);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isOpen, onClose]);

  // 실제 대화방 목록: 중복 제거 및 최신순 정렬
  const conversations = useMemo(() => {
    const unique = new Map<string, Conversation>();

    for (const page of conversationsQuery.data?.pages ?? []) {
      for (const conversation of page.items) {
        unique.set(conversation.conversationId, conversation);
      }
    }

    return [...unique.values()].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  }, [conversationsQuery.data]);

  // 실제 메시지: 중복 제거 및 오래된 순 정렬
  const messages = useMemo(() => {
    const unique = new Map<string, Message>();
    const pages = messagesQuery.data?.pages ?? [];

    for (const page of [...pages].reverse()) {
      for (const message of page.items) {
        unique.set(message.id, message);
      }
    }

    return [...unique.values()].sort((a, b) => {
      const timeDifference = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      if (timeDifference !== 0) {
        return timeDifference;
      }

      const aId = BigInt(a.id);
      const bId = BigInt(b.id);

      if (aId < bId) return -1;
      if (aId > bId) return 1;
      return 0;
    });
  }, [messagesQuery.data]);

  // 최초 전송 전에는 대화방 ID가 null일 수 있음
  const conversationId =
    messagesQuery.data?.pages[0]?.conversationId ?? selectedConversation?.conversationId ?? null;

  // 현재 조회한 메시지 중 가장 최근 수신 메시지
  const latestReceivedMessageId = useMemo(() => {
    if (!user) return null;

    const latestReceived = [...messages].reverse().find((message) => message.senderId !== user.id);

    return latestReceived?.id ?? null;
  }, [messages, user]);

  // 실제 대화방 읽음 처리
  useEffect(() => {
    if (
      !isOpen ||
      !selectedConversation ||
      !conversationId ||
      !latestReceivedMessageId ||
      messagesQuery.isPending ||
      messagesQuery.isError ||
      readMutation.isPending ||
      document.visibilityState !== "visible" ||
      !document.hasFocus()
    ) {
      return;
    }

    const attemptKey = `${conversationId}:${latestReceivedMessageId}`;

    if (readAttemptRef.current === attemptKey) {
      return;
    }

    readAttemptRef.current = attemptKey;

    readMutation.mutate(conversationId, {
      onError: () => {
        if (readAttemptRef.current === attemptKey) {
          readAttemptRef.current = null;
        }
      },
    });
  }, [
    isOpen,
    selectedConversation,
    conversationId,
    latestReceivedMessageId,
    messagesQuery.isPending,
    messagesQuery.isError,
    readMutation,
    visibilityVersion,
  ]);

  // 대화 목록에서 선택
  const handleSelectConversation = (conversation: Conversation) => {
    readAttemptRef.current = null;

    setSelectedConversation({
      conversationId: conversation.conversationId,
      otherUser: conversation.otherUser,
      source: "list",
    });
  };

  // 대화 상세 -> 목록
  const handleBack = () => {
    readAttemptRef.current = null;
    setSelectedConversation(null);
  };

  // 실제 메시지 발송
  const handleSend = async (content: string) => {
    if (!selectedConversation) {
      throw new Error("대화 상대가 없습니다.");
    }

    if (sendLockRef.current) {
      return;
    }

    sendLockRef.current = true;

    try {
      const result = await sendMutation.mutateAsync({
        otherUserId: selectedConversation.otherUser.id,
        content,
      });

      // 최초 발송 시 생성된 대화방 ID 반영
      if (!conversationId) {
        setSelectedConversation((previous) =>
          previous
            ? {
                ...previous,
                conversationId: result.conversationId,
              }
            : null,
        );
      }
    } finally {
      sendLockRef.current = false;
    }
  };

  // 이전 대화방 목록 추가 조회
  const handleLoadConversations = () => {
    if (
      !conversationsQuery.hasNextPage ||
      conversationsQuery.isFetchingNextPage ||
      conversationsQuery.isFetchNextPageError
    ) {
      return;
    }

    void conversationsQuery.fetchNextPage();
  };

  const handleRetryConversations = () => {
    if (conversationsQuery.isFetchNextPageError) {
      void conversationsQuery.fetchNextPage();
      return;
    }

    void conversationsQuery.refetch();
  };

  // 이전 메시지 추가 조회
  const handleLoadMessages = () => {
    if (
      !messagesQuery.hasNextPage ||
      messagesQuery.isFetchingNextPage ||
      messagesQuery.isFetchNextPageError
    ) {
      return;
    }

    void messagesQuery.fetchNextPage();
  };

  const handleRetryMessages = () => {
    if (messagesQuery.isFetchNextPageError) {
      void messagesQuery.fetchNextPage();
      return;
    }

    void messagesQuery.refetch();
  };

  // Hooks 호출 완료 후 렌더링 조건 확인
  if (!isOpen || status !== "authenticated" || !user || typeof document === "undefined") {
    return null;
  }

  const title = selectedConversation
    ? `${selectedConversation.otherUser.nickname}님과 쪽지`
    : "쪽지";

  // 실제 목록에서 선택한 대화방이 사라진 경우
  const isInvalidConversation =
    selectedConversation?.source === "list" &&
    !messagesQuery.isPending &&
    !messagesQuery.isError &&
    messagesQuery.data?.pages[0]?.conversationId === null;

  return createPortal(
    <div className={styles.panelLayer}>
      <aside id="pot-message-panel" className={styles.panel} role="region" aria-label={title}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            {selectedConversation && (
              <button
                type="button"
                className={styles.backButton}
                onClick={handleBack}
                aria-label="대화방 목록으로 돌아가기"
              >
                <span aria-hidden="true">←</span>
              </button>
            )}

            <h2 className={styles.title}>{title}</h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="쪽지 닫기"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {selectedConversation ? (
          <div className={styles.conversationView}>
            {isInvalidConversation ? (
              <div className={styles.errorState}>
                <p>대화방을 찾을 수 없어요.</p>

                <button type="button" className={styles.retryButton} onClick={handleBack}>
                  목록으로 돌아가기
                </button>
              </div>
            ) : (
              <>
                <MessageList
                  key={`messages-${selectedConversation.otherUser.id}`}
                  messages={messages}
                  currentUserId={user.id}
                  otherNickname={selectedConversation.otherUser.nickname}
                  otherProfileImageUrl={selectedConversation.otherUser.profileImageUrl}
                  isLoading={messagesQuery.isPending}
                  isError={messagesQuery.isError}
                  hasNextPage={messagesQuery.hasNextPage}
                  isFetchingNextPage={messagesQuery.isFetchingNextPage}
                  isNextPageError={messagesQuery.isFetchNextPageError}
                  onLoadMore={handleLoadMessages}
                  onRetry={handleRetryMessages}
                />

                <MessageComposer
                  key={`composer-${selectedConversation.otherUser.id}`}
                  onSend={handleSend}
                  isSending={sendMutation.isPending}
                  disabled={messagesQuery.isPending || messagesQuery.isError}
                />
              </>
            )}
          </div>
        ) : (
          <div className={styles.listView}>
            <ConversationList
              conversations={conversations}
              isLoading={conversationsQuery.isPending}
              isError={conversationsQuery.isError}
              hasNextPage={conversationsQuery.hasNextPage}
              isFetchingNextPage={conversationsQuery.isFetchingNextPage}
              isNextPageError={conversationsQuery.isFetchNextPageError}
              onSelectConversation={handleSelectConversation}
              onLoadMore={handleLoadConversations}
              onRetry={handleRetryConversations}
            />
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}
