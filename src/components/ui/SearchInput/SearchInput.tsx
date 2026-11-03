"use client";

import Image from "next/image";
import { useRef } from "react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "텍스트를 입력해 주세요.",
  disabled = false,
  className = "",
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className={styles.input}
        aria-label="검색창"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className={styles.actions}>
        {value && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleClear}
            disabled={disabled}
            aria-label="입력 내용 지우기"
          >
            <Image src="/icons/ic_clear.svg" alt="" width={36} height={36} />
          </button>
        )}

        <button
          type="button"
          className={styles.iconButton}
          onClick={() => onSearch(value)}
          disabled={disabled}
          aria-label="검색"
        >
          <Image src="/icons/ic_search.svg" alt="" width={36} height={36} />
        </button>
      </div>
    </div>
  );
}
