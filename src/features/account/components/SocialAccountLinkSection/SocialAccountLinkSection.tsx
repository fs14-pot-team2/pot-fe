"use client";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AuthUser } from "@/features/auth/types/auth";
import { startKakaoAuth } from "@/features/auth/utils/startKakaoAuth";
import Image from "next/image";
import styles from "./SocialAccountLinkSection.module.css";

type SocialAccountLinkSectionProps = {
  user: AuthUser;
};

export default function SocialAccountLinkSection({ user }: SocialAccountLinkSectionProps) {
  const { showToast } = useToast();

  const handleKakaoLink = () => {
    try {
      startKakaoAuth(user.role, "link", user.id);
    } catch {
      showToast({
        message: "카카오 계정 연결을 시작하지 못했어요. 다시 시도해 주세요.",
      });
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>소셜 계정 연결</h2>

      <div className={styles.providers}>
        <button type="button" className={styles.providerButton} onClick={handleKakaoLink}>
          <Image
            src="/icons/ic_kakao_login_md.svg"
            alt=""
            width={54}
            height={54}
            className={styles.iconDesktop}
          />
          <Image
            src="/icons/ic_kakao_login_sm.svg"
            alt=""
            width={44}
            height={44}
            className={styles.iconMobile}
          />
          <span>카카오 계정 연결</span>
        </button>
      </div>
    </section>
  );
}
