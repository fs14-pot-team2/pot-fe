"use client";

import { useId } from "react";
import styles from "./TextArea.module.css";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  "aria-label"?: string;
}

export default function TextArea({
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  disabled = false,
  className = "",
  label,
  required = false,
  "aria-label": ariaLabel,
}: TextAreaProps) {
  const textAreaId = useId();
  const errorId = `${textAreaId}-error`;

  return (
    <div className={`${styles.textAreaWrapper} ${className}`}>
      {label && (
        <label htmlFor={textAreaId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={`${styles.textAreaContainer} ${error ? styles.errorInput : ""}`}>
        <textarea
          id={textAreaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={styles.textArea}
        />
      </div>

      {error && (
        <p id={errorId} className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
}
