"use client";

import Button from "@/components/ui/Button/Button";
import Image from "next/image";
import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "page" | "content";
  className?: string;
};

export default function ErrorState({
  title = "정보를 불러오지 못했어요",
  description = "일시적인 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
  actionLabel = "다시 시도",
  onAction,
  variant = "content",
  className = "",
}: ErrorStateProps) {
  const containerClassName = [
    styles.container,
    variant === "page" ? styles.page : styles.content,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={containerClassName} role="alert">
      <Image
        className={styles.image}
        src="/icons/error_state.svg"
        alt=""
        width={180}
        height={180}
      />

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      {onAction && (
        <Button size="sm" className={styles.button} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </section>
  );
}
