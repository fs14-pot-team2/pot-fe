export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  otherUser: {
    id: string;
    nickname: string;
    profileImageUrl: string | null;
  };
  lastMessageAt: string;
  hasUnreadMessage: boolean;
}

export interface CursorPage {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface ConversationsResponse extends CursorPage {
  items: Conversation[];
}

export interface MessagesResponse extends CursorPage {
  conversationId: string | null;
  items: Message[];
}

export interface SendMessageInput {
  otherUserId: string;
  content: string;
}

export interface SendMessageResponse {
  conversationId: string;
  message: Message;
}

export interface UnreadMessageResponse {
  hasUnreadMessage: boolean;
}
