"use client";

import styles from "./IconButton.module.css";

type IconButtonProps = {
  children: React.ReactNode;
  "aria-label": string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">;

export default function IconButton({
  children,
  type = "button",
  className = "",
  "aria-label": ariaLabel,
  ...props
}: IconButtonProps) {
  const buttonClassName = [styles.button, className].filter(Boolean).join(" ");

  return (
    <button type={type} className={buttonClassName} aria-label={ariaLabel} {...props}>
      {children}
    </button>
  );
}
