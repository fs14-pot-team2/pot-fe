"use client";

import Button from "@/components/ui/Button/Button";
import NotificationPanel, {
  type NotificationItem,
} from "@/components/common/NotificationPanel/NotificationPanel";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import PasswordVerificationModal from "@/features/account/components/PasswordVerificationModal/PasswordVerificationModal";
import { useAuth } from "@/lib/auth/AuthProvider";

import styles from "./Header.module.css";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";

type HeaderProps = {
  isLoggedIn: boolean;
  userRole?: "OWNER" | "SITTER";
  nickname?: string;
  notifications?: NotificationItem[];
  isNotificationLoading?: boolean;
  isMarkingAllNotificationsAsRead?: boolean;
  hasUnreadNotification?: boolean;
  onLogout?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
  onMarkAllNotificationsAsRead?: () => void;
  hasNextNotificationPage?: boolean;
  isFetchingNextNotificationPage?: boolean;
  onNotificationLoadMore?: () => void;
  hasNotificationError?: boolean;
  onNotificationRetry?: () => void;
};

const MENU_ITEMS = {
  GUEST: [{ label: "팟트너 찾기", href: "/sitters" }],
  OWNER: [
    { label: "견적 요청", href: "/owner/requests/new" },
    { label: "팟트너 찾기", href: "/sitters" },
    { label: "내 견적 관리", href: "/owner/quotes" },
  ],
  SITTER: [
    { label: "받은 요청", href: "/sitter/requests" },
    { label: "내 견적 관리", href: "/sitter/quotes" },
  ],
};

export default function Header({
  isLoggedIn,
  userRole,
  nickname,
  notifications = [],
  isNotificationLoading = false,
  isMarkingAllNotificationsAsRead = false,
  hasUnreadNotification = false,
  hasNextNotificationPage = false,
  isFetchingNextNotificationPage = false,
  hasNotificationError = false,
  onNotificationRetry,
  onLogout,
  onNotificationClick,
  onMarkAllNotificationsAsRead,
  onNotificationLoadMore,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { completeAccountVerification } = useAuth();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 기본정보 관리 진입 직전 페이지 경로 보관
  const returnPathRef = useRef("/");

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const closeNotification = useCallback(() => {
    setIsNotificationOpen(false);
    window.requestAnimationFrame(() => notificationButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleBreakPointChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setIsDrawerOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleBreakPointChange);

    return () => {
      mediaQuery.removeEventListener("change", handleBreakPointChange);
    };
  }, []);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        closeNotification();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeNotification();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeNotification, isNotificationOpen]);

  // 현재 페이지를 기억한 후 비밀번호 확인 모달 열기
  const handleOpenAccount = () => {
    returnPathRef.current =
      window.location.pathname + window.location.search + window.location.hash;

    setIsPasswordModalOpen(true);
  };

  // 비밀번호 인증 성공 후 기본정보 관리 페이지로 이동
  const handleAccountVerified = () => {
    completeAccountVerification();

    const params = new URLSearchParams({
      returnTo: returnPathRef.current,
    });

    router.push(`/owner/account/edit?${params.toString()}`);
  };

  let menuItems = MENU_ITEMS.GUEST;

  if (isLoggedIn) {
    menuItems = userRole ? MENU_ITEMS[userRole] : [];
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logoLink} aria-label="POT 홈으로 이동">
            <Image
              src="/images/logo_pc.svg"
              alt="POT"
              width={90}
              height={56}
              loading="eager"
              className={styles.desktopLogo}
            />

            <Image
              src="/images/logo_tablet.svg"
              alt=""
              width={80}
              height={40}
              loading="eager"
              className={styles.tabletLogo}
            />

            <Image
              src="/images/logo_mo.svg"
              alt=""
              width={24}
              height={33}
              loading="eager"
              className={styles.mobileLogo}
            />
          </Link>

          <nav className={styles.nav} aria-label="주요 메뉴">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {!isLoggedIn && (
            <Button
              variant="solid"
              size="sm"
              className={styles.loginButton}
              onClick={() => router.push("/login")}
            >
              로그인
            </Button>
          )}

          {isLoggedIn && (
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button
                ref={notificationButtonRef}
                type="button"
                className={styles.notificationButton}
                aria-label="알림"
                aria-expanded={isNotificationOpen}
                onClick={() => {
                  if (isNotificationOpen) {
                    closeNotification();
                    return;
                  }

                  setIsNotificationOpen(true);
                }}
              >
                <Image
                  src={
                    hasUnreadNotification
                      ? "/icons/ic_notification_unread.svg"
                      : "/icons/ic_notification.svg"
                  }
                  alt=""
                  width={24}
                  height={24}
                />
              </button>

              {isNotificationOpen && (
                <div className={styles.notificationPanel}>
                  <NotificationPanel
                    notifications={notifications}
                    isLoading={isNotificationLoading}
                    isMarkingAllAsRead={isMarkingAllNotificationsAsRead}
                    hasNextPage={hasNextNotificationPage}
                    isFetchingNextPage={isFetchingNextNotificationPage}
                    onLoadMore={onNotificationLoadMore}
                    hasError={hasNotificationError}
                    onRetry={onNotificationRetry}
                    onClose={closeNotification}
                    onNotificationClick={onNotificationClick}
                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                  />
                </div>
              )}
            </div>
          )}

          {isLoggedIn && (
            <button type="button" className={styles.messageButton} aria-label="쪽지" disabled>
              <Image src="/icons/ic_message.svg" alt="" width={24} height={24} />
            </button>
          )}

          {isLoggedIn && userRole && nickname && (
            <ProfileMenu
              userRole={userRole}
              nickname={nickname}
              onLogout={onLogout}
              onOpenAccount={userRole === "OWNER" ? handleOpenAccount : undefined}
            />
          )}

          <button
            type="button"
            className={styles.menuButton}
            aria-label="메뉴 열기"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          >
            <Image src="/icons/ic_menu.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </header>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        isLoggedIn={isLoggedIn}
        menuItems={menuItems}
      />

      {isLoggedIn && userRole === "OWNER" && (
        <PasswordVerificationModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onVerified={handleAccountVerified}
        />
      )}
    </>
  );
}
