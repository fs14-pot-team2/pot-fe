"use client";

import buttonStyles from "@/components/ui/Button/Button.module.css";
import { useAuth } from "@/lib/auth/AuthProvider";
import Link from "next/link";
import styles from "./FinalCtaSection.module.css";

export default function FinalCtaActions() {
  const { status, user } = useAuth();

  const isSitter = status === "authenticated" && user?.role === "SITTER";

  const canBrowseSitters =
    status === "guest" || (status === "authenticated" && user?.role === "OWNER");

  return (
    <>
      <p className={styles.description}>
        {isSitter
          ? "POT에서 돌봄이 필요한 팟오너의 요청을 확인해 보세요."
          : canBrowseSitters
            ? "POT에서 내 식물에게 맞는 팟트너를 찾아보세요."
            : "POT에서 식물을 위한 믿을 수 있는 돌봄을 만나보세요."}
      </p>

      {(isSitter || canBrowseSitters) && (
        <Link
          href={isSitter ? "/sitter/requests" : "/sitters"}
          className={`${buttonStyles.button} ${buttonStyles.md} ${styles.link}`}
        >
          {isSitter ? "받은 요청 확인하기" : "팟트너 찾아보기"}
        </Link>
      )}
    </>
  );
}
