"use client";

import Button from "@/components/ui/Button/Button";
import styles from "./DesignatedRequestButton.module.css";

type DesignatedRequestStatus =
  | "AVAILABLE"
  | "NO_ACTIVE_REQUEST"
  | "ALREADY_DESIGNATED"
  | "LIMIT_EXCEEDED"
  | "ALREADY_SENT_QUOTE"
  | null;

type DesignatedRequestButtonProps = {
  nickname: string;
  status: DesignatedRequestStatus;
  onClick: () => void;
  isPending?: boolean;
  className?: string;
};

const BUTTON_LABELS = {
  AVAILABLE: "지정 견적 요청하기",
  NO_ACTIVE_REQUEST: "지정 견적 요청하기",
  ALREADY_DESIGNATED: "지정 견적 요청 완료",
  LIMIT_EXCEEDED: "지정 견적 횟수 소진",
  ALREADY_SENT_QUOTE: "견적 응답 완료 팟트너",
} as const;

export default function DesignatedRequestButton({
  nickname,
  status,
  onClick,
  isPending = false,
  className = "",
}: DesignatedRequestButtonProps) {
  const label = status === null ? BUTTON_LABELS.AVAILABLE : BUTTON_LABELS[status];

  const isDisabled =
    status === "ALREADY_DESIGNATED" ||
    status === "LIMIT_EXCEEDED" ||
    status === "ALREADY_SENT_QUOTE" ||
    isPending;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <p className={styles.guide}>
        {nickname} 팟트너에게
        <br />
        지정 견적을 요청해보세요!
      </p>

      <Button
        variant="solid"
        size="md"
        className={styles.button}
        disabled={isDisabled}
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}
