"use client";

import Image from "next/image";

import styles from "./CareTypeSelector.module.css";

export type CareType = "SHORT_CARE" | "REGULAR_CARE";

interface CareTypeSelectorProps {
  value: CareType | null;
  onChange: (value: CareType) => void;
  disabled?: boolean;
  className?: string;
}

const CARE_TYPES = [
  {
    value: "SHORT_CARE",
    label: "잠깐만 돌봄",
    description: "필요한 날에 찾아가요.",
    icon: "/images/care_short.png",
  },
  {
    value: "REGULAR_CARE",
    label: "꾸준히 돌봄",
    description: "정해진 날마다 찾아가요.",
    icon: "/images/care_regular.png",
  },
] as const;

export default function CareTypeSelector({
  value,
  onChange,
  disabled = false,
  className = "",
}: CareTypeSelectorProps) {
  const containerClassName = [styles.container, className].filter(Boolean).join(" ");

  return (
    <div className={containerClassName} role="group" aria-label="돌봄 방식 선택">
      {CARE_TYPES.map((type) => {
        const isSelected = value === type.value;

        const cardClassName = [styles.card, isSelected ? styles.selected : ""]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={type.value}
            type="button"
            className={cardClassName}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onChange(type.value)}
          >
            <span className={styles.content}>
              <strong className={styles.label}>{type.label}</strong>

              <span className={styles.description}>{type.description}</span>
            </span>

            <span className={styles.imageWrapper}>
              <Image
                src={type.icon}
                alt=""
                fill
                sizes="(max-width: 540px) 105px, 160px"
                className={styles.image}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
