"use client";

import Button from "@/components/ui/Button/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import styles from "./HeroSection.module.css";

export default function HeroActions() {
  const router = useRouter();
  const { user, status } = useAuth();

  const isSitter = status === "authenticated" && user?.role === "SITTER";

  const buttonText = isSitter ? "받은 요청 확인하기" : "팟트너 찾아보기";
  const destination = isSitter ? "/sitter/requests" : "/sitters";

  return (
    <div className={styles.actions}>
      <Button
        variant="solid"
        size="md"
        className={styles.primaryButton}
        onClick={() => router.push(destination)}
      >
        {buttonText}
      </Button>
    </div>
  );
}
