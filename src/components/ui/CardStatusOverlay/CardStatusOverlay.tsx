"use client";

import Button from "@/components/ui/Button/Button";
import styles from "./CardStatusOverlay.module.css";

type OverlayAction = {
  label: string;
  onClick: () => void;
};

type CardStatusOverlayProps = {
  message: string;
  action?: OverlayAction;
  className?: string;
};

export default function CardStatusOverlay({
  message,
  action,
  className = "",
}: CardStatusOverlayProps) {
  const classNames = [styles.overlay, className].filter(Boolean).join(" ");

  return (
    <div className={classNames}>
      <p className={styles.message}>{message}</p>

      {action && (
        <Button
          variant="outlined"
          size="sm"
          className={styles.actionButton}
          onClick={(event) => {
            event.stopPropagation();
            action.onClick();
          }}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
