export type SseEventPayloads = {
  "notification.created": { notificationId: string };
  "message.created": { conversationId: string; messageId: string; senderId: string };
};

export type SseEventName = keyof SseEventPayloads;

export type SseEvent = {
  [K in SseEventName]: { type: K; data: SseEventPayloads[K] };
}[SseEventName];
