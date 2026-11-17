# 공통 SSE 이벤트 구독 가이드

## 1. 기본 원칙

- SSE 서버 연결은 `SseListener.tsx`에서 공통으로 관리합니다.
- 각 기능에서는 `connectSse()`를 직접 호출하지 않습니다.
- 필요한 이벤트만 `subscribeSse()`로 구독합니다.
- React 컴포넌트가 언마운트될 때 구독을 해제합니다.

## 2. 지원 이벤트

| 이벤트                 | 전달 데이터                               |
| ---------------------- | ----------------------------------------- |
| `notification.created` | `notificationId`                          |
| `message.created`      | `conversationId`, `messageId`, `senderId` |

## 3. 사용 방법

```tsx
import { useEffect } from "react";
import { subscribeSse } from "@/lib/sse/sseSubscriptions";

export function MessageSseSubscriber() {
  useEffect(() => {
    const unsubscribe = subscribeSse("message.created", (data) => {
      console.log("새 쪽지:", data.messageId);
    });

    return () => unsubscribe();
  }, []);

  return null;
}
```

## 4. 실제 기능 연동

이벤트를 수신하면 해당 기능의 React Query 캐시를 무효화하여 데이터를 다시 조회할 수 있습니다.

- 쪽지 담당자는 쪽지 목록 및 대화방 관련 Query Key를 갱신합니다.
- 알림·견적·받은 요청 목록의 공통 갱신은 기존 `SseListener.tsx`에서 처리합니다.
- 이벤트를 구독한다고 별도의 SSE 연결이 생성되지는 않습니다.

## 5. 주의사항

- 공통 SSE는 로그인 상태이고 `NEXT_PUBLIC_SSE_ENABLED=true`일 때 연결됩니다.
- `unsubscribe()`는 해당 이벤트 구독만 해제하며 공통 SSE 연결을 종료하지 않습니다.
- 비동기 이벤트 처리 중 발생하는 오류는 각 기능에서 별도로 처리해야 합니다.
- SSE는 이벤트 수신을 항상 보장하지 않으므로 재연결·화면 복귀 시 필요한 데이터 재조회 방식도 유지해야 합니다.
