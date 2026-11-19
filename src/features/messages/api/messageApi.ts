import { apiClient } from "@/lib/api/apiClient";

import type {
  ConversationsResponse,
  MessagesResponse,
  SendMessageInput,
  SendMessageResponse,
  UnreadMessageResponse,
} from "../types/message";

const DEFAULT_LIMIT = 8;

interface CursorParams {
  cursor?: string | null;
  limit?: number;
}

// 대화방 목록 조회
export async function getConversations({
  cursor,
  limit = DEFAULT_LIMIT,
}: CursorParams = {}): Promise<ConversationsResponse> {
  const { data } = await apiClient.get<ConversationsResponse>("/conversations", {
    params: {
      limit,
      ...(cursor ? { cursor } : {}),
    },
  });

  return data;
}

// 상대방과의 메시지 목록 조회
export async function getMessages(
  otherUserId: string,
  { cursor, limit = DEFAULT_LIMIT }: CursorParams = {},
): Promise<MessagesResponse> {
  const { data } = await apiClient.get<MessagesResponse>(
    `/conversations/with/${encodeURIComponent(otherUserId)}/messages`,
    {
      params: {
        limit,
        ...(cursor ? { cursor } : {}),
      },
    },
  );

  return data;
}

// 메시지 발송
export async function sendMessage(input: SendMessageInput): Promise<SendMessageResponse> {
  const { data } = await apiClient.post<SendMessageResponse>("/messages", input);

  return data;
}

// 대화방의 미확인 메시지 읽음 처리
export async function markMessagesAsRead(conversationId: string): Promise<void> {
  await apiClient.patch(`/conversations/${encodeURIComponent(conversationId)}/messages/read`);
}

// 전체 미확인 쪽지 존재 여부 조회
export async function getUnreadMessageStatus(): Promise<UnreadMessageResponse> {
  const { data } = await apiClient.get<UnreadMessageResponse>("/messages/me/unread");

  return data;
}
