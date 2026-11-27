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
import { useMessagePanel } from "@/features/messages/context/MessagePanelProvider";

import styles from "./Header.module.css";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";

type HeaderProps = {
  isLoggedIn: boolean;
  userRole?: "OWNER" | "SITTER";
  nickname?: string;
  profileImageUrl?: string | null;
  notifications?: NotificationItem[];
  isNotificationLoading?: boolean;
  isMarkingAllNotificationsAsRead?: boolean;
  hasUnreadNotification?: boolean;
  hasUnreadMessage?: boolean;
  onLogout?: () => void;
  onNotificationClick?: (notification: NotificationItem) => boolean | Promise<boolean>;
  onMarkAllNotificationsAsRead?: () => void;
  hasNextNotificationPage?: boolean;
  isFetchingNextNotificationPage?: boolean;
  onNotificationLoadMore?: () => void;
  hasNotificationError?: boolean;
  hasNextNotificationError?: boolean;
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
  profileImageUrl,
  notifications = [],
  isNotificationLoading = false,
  isMarkingAllNotificationsAsRead = false,
  hasUnreadNotification = false,
  hasUnreadMessage = false,
  hasNextNotificationPage = false,
  isFetchingNextNotificationPage = false,
  hasNotificationError = false,
  hasNextNotificationError = false,
  onNotificationRetry,
  onLogout,
  onNotificationClick,
  onMarkAllNotificationsAsRead,
  onNotificationLoadMore,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { completeAccountVerification } = useAuth();

  const { isOpen: isMessageOpen, toggleList } = useMessagePanel();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const returnPathRef = useRef("/");

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const closeNotification = useCallback(() => {
    setIsNotificationOpen(false);

    window.requestAnimationFrame(() => {
      notificationButtonRef.current?.focus();
    });
  }, []);

  // 모바일 메뉴 반응형 처리
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

  // 알림 패널 외부 클릭 및 Escape 닫기
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

  // 기본정보 관리 진입 전 비밀번호 인증
  const handleOpenAccount = () => {
    // 이미 기본정보 관리 페이지에 있는 경우 재인증 방지
    if (pathname === "/owner/account/edit") {
      return;
    }

    returnPathRef.current =
      window.location.pathname + window.location.search + window.location.hash;

    setIsPasswordModalOpen(true);
  };

  const handleAccountVerified = () => {
    completeAccountVerification();

    const params = new URLSearchParams({
      returnTo: returnPathRef.current,
    });

    router.push(`/owner/account/edit?${params.toString()}`);
  };

  // 쪽지 패널 열기/닫기
  const handleMessageClick = () => {
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
    }

    toggleList();
  };

  // 알림 패널 열기/닫기
  const handleNotificationToggle = () => {
    if (isNotificationOpen) {
      closeNotification();
      return;
    }

    setIsNotificationOpen(true);
  };

  let menuItems = MENU_ITEMS.GUEST;

  if (isLoggedIn) {
    menuItems = userRole ? MENU_ITEMS[userRole] : [];
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          {/* 로고 */}
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

          {/* 주요 메뉴 */}
          <nav className={styles.nav} aria-label="주요 메뉴">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[styles.navLink, isActive ? styles.navLinkActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 로그인 */}
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

          {/* 알림 */}
          {isLoggedIn && (
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button
                ref={notificationButtonRef}
                type="button"
                className={styles.notificationButton}
                aria-label={hasUnreadNotification ? "읽지 않은 알림 있음" : "알림"}
                aria-expanded={isNotificationOpen}
                onClick={handleNotificationToggle}
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
                    hasUnreadNotification={hasUnreadNotification}
                    hasNextPage={hasNextNotificationPage}
                    isFetchingNextPage={isFetchingNextNotificationPage}
                    onLoadMore={onNotificationLoadMore}
                    hasError={hasNotificationError}
                    hasNextPageError={hasNextNotificationError}
                    onRetry={onNotificationRetry}
                    onClose={closeNotification}
                    onNotificationClick={(notification) => {
                      const handleNotification = async () => {
                        const shouldClose = await onNotificationClick?.(notification);

                        if (shouldClose) {
                          closeNotification();
                        }
                      };

                      void handleNotification();
                    }}
                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                  />
                </div>
              )}
            </div>
          )}

          {/* 쪽지 */}
          {isLoggedIn && (
            <button
              type="button"
              className={styles.messageButton}
              data-unread={hasUnreadMessage}
              aria-label={hasUnreadMessage ? "읽지 않은 쪽지 있음" : "쪽지"}
              aria-expanded={isMessageOpen}
              aria-controls={isMessageOpen ? "pot-message-panel" : undefined}
              onClick={handleMessageClick}
            >
              <Image src="/icons/ic_message.svg" alt="" width={24} height={24} />
            </button>
          )}

          {/* 프로필 메뉴 */}
          {isLoggedIn && userRole && nickname && (
            <ProfileMenu
              userRole={userRole}
              nickname={nickname}
              profileImageUrl={profileImageUrl}
              onLogout={onLogout}
              onOpenAccount={userRole === "OWNER" ? handleOpenAccount : undefined}
            />
          )}

          {/* 모바일 메뉴 */}
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

      {/* 팟오너 계정 인증 */}
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
