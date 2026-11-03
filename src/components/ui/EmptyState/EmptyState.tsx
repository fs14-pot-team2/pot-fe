"use client";

import Image from "next/image";

import Button from "@/components/ui/Button/Button";

import styles from "./EmptyState.module.css";

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateProps = {
  messages: string[];
  action?: EmptyStateAction;
  className?: string;
};

export default function EmptyState({ messages, action, className = "" }: EmptyStateProps) {
  const emptyStateClassName = [styles.container, className].filter(Boolean).join(" ");

  return (
    <div className={emptyStateClassName}>
      <div className={styles.iconWrapper}>
        <Image src="/icons/empty_state.svg" alt="" fill sizes="128px" />
      </div>

      <div className={styles.messages}>
        {messages.map((message, index) => (
          <p key={index} className={styles.message}>
            {message}
          </p>
        ))}
      </div>

      {action && (
        <Button size="sm" className={styles.actionButton} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
