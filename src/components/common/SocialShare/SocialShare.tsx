"use client";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import Image from "next/image";
import Script from "next/script";
import styles from "./SocialShare.module.css";

type SocialShareProps = {
  url: string;
  title: string;
  className?: string;
};

type KakaoWindow = Window & {
  Kakao?: {
    init: (appKey: string) => void;
    isInitialized: () => boolean;
    Share: {
      sendScrap: (options: { requestUrl: string }) => void;
    };
  };
};

const shareButtons = [
  { id: "share", label: "링크 복사" },
  { id: "kakao", label: "카카오톡 공유" },
  { id: "facebook", label: "Facebook 공유" },
] as const;

export default function SocialShare({ url, title, className = "" }: SocialShareProps) {
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast({ message: "링크가 복사되었습니다." });
    } catch {
      showToast({ message: "링크 복사에 실패했습니다." });
    }
  };

  const handleFacebookShare = () => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookShareUrl, "_blank", "noopener,noreferrer");
  };

  const handleKakaoShare = () => {
    const kakao = (window as KakaoWindow).Kakao;

    if (!kakao?.isInitialized()) {
      showToast({ message: "카카오톡 공유 기능을 사용할 수 없습니다." });
      return;
    }

    kakao.Share.sendScrap({ requestUrl: url });
  };

  const clickHandlers = {
    share: handleCopy,
    kakao: handleKakaoShare,
    facebook: handleFacebookShare,
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js"
        integrity="sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onReady={() => {
          const kakao = (window as KakaoWindow).Kakao;
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

          if (!kakao || !kakaoKey) return;

          if (!kakao.isInitialized()) {
            kakao.init(kakaoKey);
          }
        }}
      />

      <section className={`${styles.wrapper} ${className}`} aria-label={title}>
        <p className={styles.title}>{title}</p>

        <div className={styles.buttons}>
          {shareButtons.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={styles.iconButton}
              aria-label={label}
              onClick={clickHandlers[id]}
            >
              <Image
                src={`/icons/ic_${id}.svg`}
                alt=""
                width={64}
                height={64}
                className={styles.desktopIcon}
              />
              <Image
                src={`/icons/ic_${id}_mobile.svg`}
                alt=""
                width={40}
                height={40}
                className={styles.mobileIcon}
              />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
