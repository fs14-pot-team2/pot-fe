import type { ComponentPropsWithoutRef } from "react";
import styles from "./PageMain.module.css";

type PageMainProps = ComponentPropsWithoutRef<"main"> & {
  /** Full-width sections retain the page's own vertical spacing. */
  variant?: "standard" | "fullWidth";
};

export default function PageMain({ variant = "standard", className, ...props }: PageMainProps) {
  return (
    <main
      {...props}
      className={[styles.main, variant === "standard" && styles.standard, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
