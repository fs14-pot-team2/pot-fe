"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getConversations,
  getMessages,
  getUnreadMessageStatus,
  markMessagesAsRead,
  sendMessage,
} from "../api/messageApi";

import { useAuth } from "@/lib/auth/AuthProvider";

export const messageKeys = {
  all: ["messages"] as const,

  conversations: () => [...messageKeys.all, "conversations"] as const,

  conversation: (otherUserId: string) => [...messageKeys.all, "conversation", otherUserId] as const,

  unread: () => [...messageKeys.all, "unread"] as const,
};

// 대화방 목록 조회 (아래 방향 무한 스크롤)
export function useConversations(enabled = true) {
  const { status } = useAuth();

  return useInfiniteQuery({
    queryKey: messageKeys.conversations(),

    queryFn: ({ pageParam }) =>
      getConversations({
        cursor: pageParam,
      }),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,

    enabled: enabled && status === "authenticated",
    retry: 1,
  });
}

// 상대방과의 메시지 목록 조회 (위 방향 무한 스크롤)
export function useMessages(otherUserId: string | null, enabled = true) {
  const { status } = useAuth();

  return useInfiniteQuery({
    queryKey: messageKeys.conversation(otherUserId ?? ""),

    queryFn: ({ pageParam }) => {
      if (!otherUserId) {
        throw new Error("쪽지 상대방 정보가 없습니다.");
      }

      return getMessages(otherUserId, {
        cursor: pageParam,
      });
    },

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined,

    enabled: enabled && status === "authenticated" && Boolean(otherUserId),

    retry: 1,
  });
}

// GNB 미확인 쪽지 여부 조회
export function useUnreadMessageStatus(enabled = true) {
  const { status } = useAuth();

  return useQuery({
    queryKey: messageKeys.unread(),
    queryFn: getUnreadMessageStatus,
    enabled: enabled && status === "authenticated",
    retry: 1,
  });
}

// 메시지 발송
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.otherUserId),
      });

      void queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });

      void queryClient.invalidateQueries({
        queryKey: messageKeys.unread(),
      });
    },
  });
}

// 대화방 메시지 읽음 처리
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessagesAsRead,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: messageKeys.conversations(),
      });

      void queryClient.invalidateQueries({
        queryKey: messageKeys.unread(),
      });
    },
  });
}
