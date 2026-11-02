"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./BottomSheet.module.css";
import Button from "@/components/ui/Button/Button";
import FilterReset from "@/components/ui/FilterReset/FilterReset";
import Toggle from "@/components/ui/Toggle/Toggle";

type FilterTab = "region" | "careType" | "gender";

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "지역", value: "region" },
  { label: "돌봄 방식", value: "careType" },
  { label: "성별", value: "gender" },
];

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
  children: Record<FilterTab, React.ReactNode>;
  className?: string;
};

export default function BottomSheet({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  className = "",
}: BottomSheetProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("region");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={sheetClassName}
      aria-label="필터"
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>필터</h2>

        <button
          className={styles.closeButton}
          type="button"
          aria-label="필터 닫기"
          onClick={onClose}
        >
          <Image src="/icons/ic_close.svg" alt="" width={24} height={24} />
        </button>
      </header>

      <Toggle
        options={FILTER_TABS}
        value={activeTab}
        onChange={(value) => setActiveTab(value as FilterTab)}
        variant="filter"
      />

      <div className={styles.content}>{children[activeTab]}</div>

      <footer className={styles.footer}>
        <div className={styles.resetButton}>
          <FilterReset onReset={onReset} />
        </div>

        <Button className={styles.applyButton} variant="solid" onClick={onApply}>
          적용
        </Button>
      </footer>
    </dialog>
  );
}
