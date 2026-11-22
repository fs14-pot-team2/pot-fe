"use client";

import Button from "@/components/ui/Button/Button";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { AuthUser } from "@/features/auth/types/auth";
import { startSocialAuth, type SocialProvider } from "@/features/auth/utils/socialOAuth";
import Image from "next/image";
import styles from "./SocialAccountLinkSection.module.css";

type SocialAccountLinkSectionProps = {
  user: AuthUser;
};

const SOCIAL_PROVIDERS = [
  {
    id: "KAKAO",
    name: "카카오",
    description: "카카오 계정으로 간편하게 로그인하세요.",
    icon: "/icons/ic_kakao_login_md.svg",
  },
  {
    id: "GOOGLE",
    name: "구글",
    description: "구글 계정으로 간편하게 로그인하세요.",
    icon: "/icons/ic_google_login_md.svg",
  },
] as const;

export default function SocialAccountLinkSection({ user }: SocialAccountLinkSectionProps) {
  const { showToast } = useToast();

  const handleSocialLink = (provider: SocialProvider) => {
    try {
      startSocialAuth(provider, user.role, "link", user.id);
    } catch {
      const providerName = provider === "KAKAO" ? "카카오" : "구글";

      showToast({
        message: `${providerName} 계정 연결을 시작하지 못했어요. 다시 시도해 주세요.`,
      });
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>소셜 계정 연결</h2>

      <div className={styles.providers}>
        {SOCIAL_PROVIDERS.map((provider) => (
          <div key={provider.id} className={styles.providerRow}>
            <Image
              src={provider.icon}
              alt=""
              width={44}
              height={44}
              className={styles.providerIcon}
            />

            <div className={styles.providerInfo}>
              <span className={styles.providerName}>{provider.name}</span>
              <p className={styles.providerDescription}>{provider.description}</p>
            </div>

            <Button
              type="button"
              variant="outlined"
              size="sm"
              className={styles.linkButton}
              aria-label={`${provider.name} 계정 연결하기`}
              onClick={() => handleSocialLink(provider.id)}
            >
              연결하기
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
