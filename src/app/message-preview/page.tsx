"use client";

import { useState } from "react";

import ConversationList from "@/components/common/Message/ConversationList/ConversationList";
import MessageList from "@/components/common/Message/MessageList/MessageList";
import MessageComposer from "@/components/common/Message/MessageComposer/MessageComposer";

import type { Conversation, Message } from "@/features/messages/types/message";

const CURRENT_USER_ID = "1";

const EMPTY_CONVERSATION: Conversation = {
  conversationId: "preview-new",
  otherUser: {
    id: "4",
    nickname: "잎사귀",
    profileImageUrl: null,
  },
  lastMessageAt: "",
  hasUnreadMessage: false,
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    conversationId: "101",
    otherUser: {
      id: "2",
      nickname: "새싹이",
      profileImageUrl: null,
    },
    lastMessageAt: "2026-11-16T11:30:00+09:00",
    hasUnreadMessage: true,
  },
  {
    conversationId: "102",
    otherUser: {
      id: "3",
      nickname: "초록정원",
      profileImageUrl: null,
    },
    lastMessageAt: "2026-11-15T18:20:00+09:00",
    hasUnreadMessage: false,
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  "2": [
    {
      id: "1",
      senderId: "2",
      content: "안녕하세요! 돌봄 요청 보고 연락드렸어요.",
      createdAt: "2026-11-15T11:20:00+09:00",
    },
    {
      id: "2",
      senderId: CURRENT_USER_ID,
      content: "안녕하세요! 견적 보내주셔서 감사합니다.",
      createdAt: "2026-11-15T11:25:00+09:00",
    },
    {
      id: "3",
      senderId: "2",
      content: "네! 혹시 식물은 총 몇 개 정도 될까요?",
      createdAt: "2026-11-16T11:30:00+09:00",
    },
  ],
  "3": [
    {
      id: "4",
      senderId: CURRENT_USER_ID,
      content: "안녕하세요! 돌봄 일정 확인 부탁드려요.",
      createdAt: "2026-11-15T18:20:00+09:00",
    },
  ],
  "4": [],
};

function sortConversations(items: Conversation[]): Conversation[] {
  return [...items].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

export default function MessagePreviewPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);

  const selectedUserId = selectedConversation?.otherUser.id ?? null;

  const messages = selectedUserId ? (messagesByUser[selectedUserId] ?? []) : [];

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    setConversations((previous) =>
      previous.map((item) =>
        item.conversationId === conversation.conversationId
          ? {
              ...item,
              hasUnreadMessage: false,
            }
          : item,
      ),
    );
  };

  const handleStartNewConversation = () => {
    setSelectedConversation(EMPTY_CONVERSATION);
  };

  const handleSend = async (content: string) => {
    if (!selectedUserId) {
      throw new Error("대화 상대가 없습니다.");
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: CURRENT_USER_ID,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessagesByUser((previous) => ({
      ...previous,
      [selectedUserId]: [...(previous[selectedUserId] ?? []), newMessage],
    }));

    const existingConversation = conversations.find(
      (conversation) => conversation.otherUser.id === selectedUserId,
    );

    if (existingConversation) {
      setConversations((previous) =>
        sortConversations(
          previous.map((conversation) =>
            conversation.otherUser.id === selectedUserId
              ? {
                  ...conversation,
                  lastMessageAt: newMessage.createdAt,
                  hasUnreadMessage: false,
                }
              : conversation,
          ),
        ),
      );
    } else if (selectedConversation) {
      const createdConversation: Conversation = {
        ...selectedConversation,
        conversationId: `preview-${selectedUserId}`,
        lastMessageAt: newMessage.createdAt,
        hasUnreadMessage: false,
      };

      setConversations((previous) => sortConversations([createdConversation, ...previous]));

      setSelectedConversation(createdConversation);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#f3f0e6",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: "0 0 12px",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          POT 쪽지 UI 미리보기
        </h1>

        <p
          style={{
            margin: "0 0 16px",
            color: "#777",
            fontSize: 14,
          }}
        >
          실제 API 연결 전 목데이터로 확인하는 화면입니다.
        </p>

        {!selectedConversation && (
          <button
            type="button"
            onClick={handleStartNewConversation}
            style={{
              marginBottom: 20,
              padding: "10px 16px",
              border: "1px solid #a7a984",
              borderRadius: 8,
              backgroundColor: "#fefdf9",
              color: "#505b39",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + 새 대화 미리보기 (잎사귀)
          </button>
        )}

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: 600,
            maxHeight: "75dvh",
            minHeight: 0,
            overflow: "hidden",
            border: "1px solid #a7a984",
            borderRadius: 16,
            backgroundColor: "#fefdf9",
          }}
        >
          <header
            style={{
              display: "flex",
              flex: "0 0 auto",
              alignItems: "center",
              gap: 12,
              padding: "18px 20px",
              borderBottom: "1px solid #e7e7dd",
            }}
          >
            {selectedConversation && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #a7a984",
                  borderRadius: 6,
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
                aria-label="대화방 목록으로 돌아가기"
              >
                ←
              </button>
            )}

            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {selectedConversation ? selectedConversation.otherUser.nickname : "쪽지"}
            </h2>
          </header>

          {selectedConversation ? (
            <>
              <MessageList
                key={`messages-${selectedConversation.otherUser.id}`}
                messages={messages}
                currentUserId={CURRENT_USER_ID}
                otherNickname={selectedConversation.otherUser.nickname}
                otherProfileImageUrl={selectedConversation.otherUser.profileImageUrl}
              />

              <MessageComposer
                key={`composer-${selectedConversation.otherUser.id}`}
                onSend={handleSend}
              />
            </>
          ) : (
            <ConversationList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </section>
      </div>
    </main>
  );
}
