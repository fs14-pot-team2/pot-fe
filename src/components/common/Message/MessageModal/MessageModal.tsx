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

  // GNB 진입: 대화방 목록
  // 견적 카드/상세 진입: 해당 팟트너와의 대화
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

  const isPanelVisible = isOpen && status === "authenticated" && Boolean(user);

  // 대화방 목록 API
  const conversationsQuery = useConversations(isOpen && isConversationList);

  // 메시지 목록 API
  const messagesQuery = useMessages(
    selectedConversation?.otherUser.id ?? null,
    isOpen && !isConversationList,
  );

  // 메시지 전송 및 읽음 처리 API
  const sendMutation = useSendMessage();
  const readMutation = useMarkMessagesAsRead();

  // 최초 조회 오류와 추가 페이지 조회 오류 구분
  const isInitialConversationsError = conversationsQuery.isError && !conversationsQuery.data;

  const isInitialMessagesError = messagesQuery.isError && !messagesQuery.data;

  // 모바일에서 쪽지 패널 활성화 시 배경 스크롤 제한
  useEffect(() => {
    if (!isPanelVisible) return;

    const mediaQuery = window.matchMedia("(max-width: 540px)");
    const body = document.body;

    let previousOverflow: string | null = null;

    // 기존 스크롤 설정 복원
    const unlockScroll = () => {
      if (previousOverflow === null) return;

      body.style.overflow = previousOverflow;
      previousOverflow = null;
    };

    // 모바일 여부에 따라 스크롤 잠금 상태 동기화
    const syncScrollLock = () => {
      if (mediaQuery.matches) {
        // 이미 잠금 상태라면 중복 적용하지 않음
        if (previousOverflow !== null) return;

        previousOverflow = body.style.overflow;
        body.style.overflow = "hidden";
      } else {
        unlockScroll();
      }
    };

    // 최초 패널 활성화 시 적용
    syncScrollLock();

    // 화면 크기 변경 시 모바일 여부 재확인
    mediaQuery.addEventListener("change", syncScrollLock);

    // 패널 종료 및 컴포넌트 언마운트 시 복원
    return () => {
      mediaQuery.removeEventListener("change", syncScrollLock);
      unlockScroll();
    };
  }, [isPanelVisible]);

  // 모바일에서 패널 열릴 때 닫기 버튼에 포커스
  useEffect(() => {
    if (!isPanelVisible) return;

    const isMobile = window.matchMedia("(max-width: 540px)").matches;

    if (isMobile) {
      closeButtonRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [isPanelVisible]);

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

  // 대화방 목록: 중복 제거 및 최신순 정렬
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

  // 메시지 목록: 중복 제거 및 오래된 순 정렬
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

  // 최초 발송 전에는 대화방 ID가 없을 수 있음
  const conversationId =
    messagesQuery.data?.pages[0]?.conversationId ?? selectedConversation?.conversationId ?? null;

  // 현재 조회한 가장 최근 수신 메시지
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
      isInitialMessagesError ||
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
    isInitialMessagesError,
    readMutation,
    visibilityVersion,
  ]);

  // 대화방 목록에서 대화 상대 선택
  const handleSelectConversation = (conversation: Conversation) => {
    readAttemptRef.current = null;

    setSelectedConversation({
      conversationId: conversation.conversationId,
      otherUser: conversation.otherUser,
      source: "list",
    });
  };

  // 메시지 상세 -> 대화방 목록
  const handleBack = () => {
    readAttemptRef.current = null;
    setSelectedConversation(null);
  };

  // 메시지 전송
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

  // 대화방 목록: 일반 무한 스크롤
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

  // 대화방 목록: 최초 조회/추가 페이지 재시도
  const handleRetryConversations = () => {
    if (conversationsQuery.isFetching) {
      return;
    }

    if (conversationsQuery.isFetchNextPageError) {
      void conversationsQuery.fetchNextPage();
      return;
    }

    void conversationsQuery.refetch();
  };

  // 메시지 목록: 일반 무한 스크롤
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

  // 메시지 목록: 최초 조회/추가 페이지 재시도
  const handleRetryMessages = () => {
    if (messagesQuery.isFetching) {
      return;
    }

    if (messagesQuery.isFetchNextPageError) {
      void messagesQuery.fetchNextPage();
      return;
    }

    void messagesQuery.refetch();
  };

  // Hooks 호출 후 렌더링 조건 확인
  if (!isPanelVisible || !user || typeof document === "undefined") {
    return null;
  }

  const title = selectedConversation
    ? `${selectedConversation.otherUser.nickname}님과 쪽지`
    : "쪽지";

  // 목록에서 선택한 대화방이 유효하지 않은 경우
  const isInvalidConversation =
    selectedConversation?.source === "list" &&
    !messagesQuery.isPending &&
    !isInitialMessagesError &&
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
                  isError={isInitialMessagesError}
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
                  disabled={messagesQuery.isPending || isInitialMessagesError}
                />
              </>
            )}
          </div>
        ) : (
          <div className={styles.listView}>
            <ConversationList
              conversations={conversations}
              isLoading={conversationsQuery.isPending}
              isError={isInitialConversationsError}
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
