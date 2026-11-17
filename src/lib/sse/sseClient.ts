import axios from "axios";
import { refreshAccessToken } from "@/features/auth/api/authApi";
import { getAccessToken, setAccessToken } from "@/lib/auth/accessToken";
import type { SseEvent } from "./sseTypes";

type SseOptions = {
  onReconnect?: () => void;
  onAuthError?: () => void;
};

class SseAuthError extends Error {}

const RECONNECT_DELAY = 3000;

function fetchEvents(token: string, signal: AbortSignal) {
  return fetch("/api/events", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
    cache: "no-store",
  });
}

async function openSseConnection(signal: AbortSignal): Promise<Response | null> {
  let token = getAccessToken();
  if (!token) throw new SseAuthError("Access Token이 없습니다.");

  let response = await fetchEvents(token, signal);

  if (response.status === 401) {
    const body: unknown = await response.json().catch(() => null);

    const isExpired =
      typeof body === "object" && body !== null && "code" in body && body.code === "TOKEN_EXPIRED";

    if (!isExpired) throw new SseAuthError("SSE 인증 실패");

    const currentToken = getAccessToken();
    if (!currentToken) throw new SseAuthError("로그아웃된 상태입니다.");

    if (currentToken === token) {
      try {
        const { accessToken } = await refreshAccessToken();

        // 토큰 갱신 중 로그아웃하거나 세션이 변경됐다면 이전 연결은 중단
        if (signal.aborted || getAccessToken() !== token) return null;

        setAccessToken(accessToken);
        token = accessToken;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          throw new SseAuthError("Refresh Token이 유효하지 않습니다.");
        }
        throw error;
      }
    } else {
      // 다른 API 요청이 이미 토큰을 갱신했다면 재사용
      token = currentToken;
    }

    response = await fetchEvents(token, signal);
  }

  if (response.status === 401 || response.status === 403) {
    throw new SseAuthError("SSE 인증 실패");
  }

  if (!response.ok) {
    throw new Error(`SSE 연결 실패: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.toLowerCase().startsWith("text/event-stream")) {
    throw new Error(`SSE 응답 형식 오류: ${contentType ?? "unknown"}`);
  }

  return response;
}

async function readSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: SseEvent) => void,
  signal: AbortSignal,
) {
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;

      // 잘려서 도착한 데이터들을 모음 (잘려서 따로 오는 SSE 이벤트 방지)
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      // SSE 이벤트는 빈 줄(\n\n)을 기준으로 구분된다.
      const chunks = buffer.split("\n\n");
      buffer = chunks.pop() ?? "";

      for (const chunk of chunks) {
        const lines = chunk.split("\n");

        const eventType = lines
          .find((line) => line.startsWith("event:"))
          ?.slice(6)
          .trim();

        const dataText = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n");

        if (!dataText) continue;

        let data: unknown;

        try {
          data = JSON.parse(dataText);
        } catch {
          continue;
        }

        if (typeof data !== "object" || data === null) continue;

        if (
          eventType === "notification.created" &&
          "notificationId" in data &&
          typeof data.notificationId === "string"
        ) {
          onEvent({
            type: eventType,
            data: { notificationId: data.notificationId },
          });
        } else if (
          eventType === "message.created" &&
          "conversationId" in data &&
          typeof data.conversationId === "string" &&
          "messageId" in data &&
          typeof data.messageId === "string" &&
          "senderId" in data &&
          typeof data.senderId === "string"
        ) {
          onEvent({
            type: eventType,
            data: {
              conversationId: data.conversationId,
              messageId: data.messageId,
              senderId: data.senderId,
            },
          });
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function waitForReconnect(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.resolve();

  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };

    const timer = setTimeout(finish, RECONNECT_DELAY);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export function connectSse(
  onEvent: (event: SseEvent) => void,
  options: SseOptions = {},
): () => void {
  const controller = new AbortController();
  const signal = controller.signal;
  let hasConnected = false;

  const run = async () => {
    while (!signal.aborted) {
      if (!getAccessToken()) return;

      try {
        const response = await openSseConnection(signal);
        if (!response) continue;

        const reader = response.body?.getReader();
        if (!reader) throw new Error("SSE 응답 스트림이 없습니다.");

        if (hasConnected) options.onReconnect?.();
        hasConnected = true;

        await readSseStream(reader, onEvent, signal);
      } catch (error) {
        if (signal.aborted) return;

        // 인증 오류는 반복 재시도하지 않고 상위 인증 관리 코드에 알린다.
        if (error instanceof SseAuthError) {
          options.onAuthError?.();
          return;
        }

        console.error("SSE 연결 오류:", error);
      }

      // 네트워크 오류 또는 스트림 종료 시 3초 뒤 재연결
      if (!signal.aborted) {
        await waitForReconnect(signal);
      }
    }
  };

  void run();

  // 로그아웃, 사용자 변경, 컴포넌트 해제 시 호출할 종료 함수
  return () => controller.abort();
}
