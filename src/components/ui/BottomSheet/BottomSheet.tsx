"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sheetClassName = [styles.sheet, className].filter(Boolean).join(" ");

  const handleApply = () => {
    onApply();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={sheetClassName}
        role="dialog"
        aria-modal="true"
        aria-label="필터"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>필터</h2>

          <button
            className={styles.closeButton}
            type="button"
            aria-label="필터 닫기"
            onClick={onClose}
          >
            ×
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

          <Button className={styles.applyButton} variant="solid" onClick={handleApply}>
            적용
          </Button>
        </footer>
      </section>
    </div>
  );
}
