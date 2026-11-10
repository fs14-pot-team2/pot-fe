"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./BottomSheet.module.css";
import Button from "@/components/ui/Button/Button";
import FilterReset from "@/components/ui/FilterReset/FilterReset";
import Toggle from "@/components/ui/Toggle/Toggle";

export type BottomSheetTab = {
  label: string;
  value: string;
};

type BottomSheetOptionProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function BottomSheetOption({ label, selected, onClick, disabled }: BottomSheetOptionProps) {
  const optionClassName = [
    styles.option,
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={optionClassName}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  tabs: BottomSheetTab[];
  children: Record<string, React.ReactNode>;
  className?: string;
};

export default function BottomSheet({
  isOpen,
  onClose,
  onApply,
  onReset,
  tabs,
  children,
  className = "",
}: BottomSheetProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value ?? "");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(min-width: 541px)");

    const handleScreenChange = () => {
      if (mediaQuery.matches) {
        onClose();
      }
    };

    handleScreenChange();

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!isOpen) {
      if (dialog.open) {
        dialog.close();
      }

      return;
    }

    dialog.removeAttribute("data-closing");

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    if (!dialog.open) {
      dialog.showModal();
    }

    return () => {
      document.body.style.overflow = originalOverflow;

      if (dialog.open) {
        dialog.close();
      }

      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  const sheetClassName = [styles.sheet, className].filter(Boolean).join(" ");

  const handleClose = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    dialogRef.current?.setAttribute("data-closing", "");
  };

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDialogElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "transform" &&
      dialogRef.current?.hasAttribute("data-closing")
    ) {
      onClose();
    }
  };

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    handleClose();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleApply = () => {
    if (dialogRef.current?.hasAttribute("data-closing")) return;

    onApply();
    handleClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={sheetClassName}
      aria-label="필터"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onTransitionEnd={handleTransitionEnd}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>필터</h2>

        <button
          className={styles.closeButton}
          type="button"
          aria-label="필터 닫기"
          onClick={handleClose}
        >
          <Image src="/icons/ic_close.svg" alt="" width={24} height={24} />
        </button>
      </header>

      <Toggle options={tabs} value={activeTab} onChange={setActiveTab} variant="filter" />

      <div className={styles.content}>{children[activeTab]}</div>

      <footer className={styles.footer}>
        <div className={styles.resetButton}>
          <FilterReset onReset={onReset} />
        </div>

        <Button className={styles.applyButton} variant="solid" onClick={handleApply}>
          적용
        </Button>
      </footer>
    </dialog>
  );
}
