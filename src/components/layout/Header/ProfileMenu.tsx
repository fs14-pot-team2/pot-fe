"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./ProfileMenu.module.css";

type ProfileMenuProps = {
  userRole: "OWNER" | "SITTER";
  nickname: string;
  profileImageUrl?: string | null;
  onOpenAccount?: () => void;
  onLogout?: () => void;
};

export default function ProfileMenu({
  userRole,
  nickname,
  profileImageUrl,
  onOpenAccount,
  onLogout,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const hasProfileImage = Boolean(profileImageUrl && failedImageUrl !== profileImageUrl);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src={hasProfileImage && profileImageUrl ? profileImageUrl : "/icons/ic_profile.svg"}
          alt=""
          width={36}
          height={36}
          className={hasProfileImage ? styles.profileImage : undefined}
          onError={() => {
            if (hasProfileImage && profileImageUrl) {
              setFailedImageUrl(profileImageUrl);
            }
          }}
        />
        <span>{nickname}</span>
      </button>

      {isOpen && (
        <nav className={styles.menu} aria-label="프로필 메뉴">
          <p className={styles.menuNickname}>
            <span>{nickname}</span>
            <span className={styles.roleLabel}>{userRole === "OWNER" ? "팟오너" : "팟트너"}</span>
          </p>
          {userRole === "OWNER" ? (
            <>
              <Link
                href="/owner/profile"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                프로필 관리
              </Link>

              <button
                type="button"
                className={styles.menuItem}
                disabled={!onOpenAccount}
                onClick={() => {
                  onOpenAccount?.();
                  setIsOpen(false);
                }}
              >
                기본정보 관리
              </button>

              <Link
                href="/owner/reviews/available"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                이용 리뷰
              </Link>
            </>
          ) : (
            <Link href="/sitter/my" className={styles.menuItem} onClick={() => setIsOpen(false)}>
              마이페이지
            </Link>
          )}

          <button
            type="button"
            className={styles.menuItem}
            disabled={!onLogout}
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
          >
            로그아웃
          </button>
        </nav>
      )}
    </div>
  );
}
