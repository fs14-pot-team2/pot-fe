"use client";

import { useId, useState } from "react";
import Image from "next/image";
import styles from "./Input.module.css";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  required?: boolean;
}

export default function Input({
  value,
  onChange,
  type = "text",
  label,
  placeholder,
  maxLength,
  error,
  disabled = false,
  readOnly = false,
  className = "",
  required = false,
}: InputProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`${styles.inputWrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={styles.inputContainer}>
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`${styles.input} ${
            error ? styles.errorInput : ""
          } ${isPassword ? styles.passwordInput : ""}`}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.visibilityButton}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
            aria-pressed={showPassword}
          >
            <Image
              src={showPassword ? "/icons/ic_visible_on.svg" : "/icons/ic_visible_off.svg"}
              alt=""
              width={20}
              height={20}
            />
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className={styles.errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
}
