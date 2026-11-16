export type SseEventPayloads = {
  "notification.created": { notificationId: string };
  "message.created": { conversationId: string; messageId: string; senderId: string };
};

export type SseEventName = keyof SseEventPayloads;
