"use client";

import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import styles from "./MessageComposer.module.css";

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  isSending?: boolean;
  disabled?: boolean;
}

const MIN_LENGTH = 1;
const MAX_LENGTH = 1000;

function getContentLength(value: string): number {
  return value.replace(/\s/g, "").length;
}

export default function MessageComposer({
  onSend,
  isSending = false,
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enter와 버튼 클릭으로 동시에 전송되는 상황 방지
  const sendLockRef = useRef(false);

  const contentLength = getContentLength(content);

  const isValid =
    contentLength >= MIN_LENGTH && contentLength <= MAX_LENGTH && content.length <= MAX_LENGTH;

  const isBusy = isSending || isSubmitting;

  const canSend = isValid && !isBusy && !disabled;

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    // 같은 렌더링 사이클에서 발생하는 중복 요청까지 차단
    if (sendLockRef.current || isSending || isSubmitting || disabled) {
      return;
    }

    if (!isValid) {
      if (contentLength < MIN_LENGTH) {
        setError("쪽지는 공백 제외 1자 이상 입력해 주세요.");
      } else if (contentLength > MAX_LENGTH || content.length > MAX_LENGTH) {
        setError("쪽지는 최대 1,000자까지 입력할 수 있어요.");
      }

      return;
    }

    sendLockRef.current = true;
    setIsSubmitting(true);

    try {
      await onSend(content);

      setContent("");
      setError(null);
    } catch {
      // 전송 실패 시 작성한 메시지 유지
      setError("쪽지를 보내지 못했어요. 다시 시도해 주세요.");
    } finally {
      sendLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 IME 조합 중 Enter로 인한 오전송 방지
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    // Shift + Enter: 기본 줄바꿈 동작 유지
    if (event.shiftKey) {
      return;
    }

    // Enter: 전송
    event.preventDefault();

    if (canSend && !sendLockRef.current) {
      void handleSubmit();
    }
  };

  const handleChange = (value: string) => {
    setContent(value);

    if (error) {
      setError(null);
    }
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <label htmlFor="message-content" className={styles.srOnly}>
        쪽지 내용
      </label>

      <textarea
        id="message-content"
        className={styles.textarea}
        value={content}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="쪽지를 입력해 주세요."
        maxLength={MAX_LENGTH}
        rows={3}
        disabled={disabled || isBusy}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "message-content-error" : undefined}
      />

      <div className={styles.footer}>
        <div className={styles.information}>
          {error ? (
            <p id="message-content-error" className={styles.error} role="alert">
              {error}
            </p>
          ) : (
            <span className={styles.length}>
              공백 제외 {contentLength} / {MAX_LENGTH}자
            </span>
          )}
        </div>

        <button
          type="submit"
          className={styles.sendButton}
          disabled={!canSend}
          aria-label="쪽지 보내기"
        >
          {isBusy ? "전송 중..." : "보내기"}
        </button>
      </div>
    </form>
  );
}
