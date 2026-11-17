import type { SseEvent, SseEventName, SseEventPayloads } from "./sseTypes";

type SseEventHandler = (event: SseEvent) => void;

const subscribers = new Set<SseEventHandler>();

export function subscribeSse<K extends SseEventName>(
  eventName: K,
  handler: (data: SseEventPayloads[K]) => void,
): () => void {
  const listener: SseEventHandler = (event) => {
    if (event.type === eventName) {
      handler(event.data as SseEventPayloads[K]);
    }
  };

  subscribers.add(listener);

  return () => {
    subscribers.delete(listener);
  };
}

export function publishSse(event: SseEvent): void {
  for (const handler of subscribers) {
    try {
      handler(event);
    } catch (error) {
      console.error("SSE 구독자 처리 오류:", error);
    }
  }
}
