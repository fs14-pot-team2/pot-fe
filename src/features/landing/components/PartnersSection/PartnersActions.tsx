"use client";

import buttonStyles from "@/components/ui/Button/Button.module.css";
import { useAuth } from "@/lib/auth/AuthProvider";
import Link from "next/link";
import styles from "./PartnersSection.module.css";

export default function PartnersActions() {
  const { status, user } = useAuth();

  const canBrowseSitters =
    status === "guest" || (status === "authenticated" && user?.role === "OWNER");

  if (!canBrowseSitters) return null;

  return (
    <Link
      href="/sitters"
      className={`${buttonStyles.button} ${buttonStyles.solid} ${buttonStyles.sm} ${styles.link}`}
    >
      전체 팟트너 둘러보기
    </Link>
  );
}
