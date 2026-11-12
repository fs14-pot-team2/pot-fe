"use client";

import Button from "@/components/ui/Button/Button";
import NotificationPanel, {
  type NotificationItem,
} from "@/components/common/NotificationPanel/NotificationPanel";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";
import MobileDrawer from "./MobileDrawer";
import ProfileMenu from "./ProfileMenu";

type HeaderProps = {
  isLoggedIn: boolean;
  userRole?: "OWNER" | "SITTER";
  nickname?: string;
  notifications?: NotificationItem[];
  onLogout?: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
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
  onLogout,
  onNotificationClick,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const hasUnreadNotification = notifications.some((notification) => !notification.isRead);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
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
        setIsNotificationOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen]);

  let menuItems = MENU_ITEMS.GUEST;

  if (isLoggedIn) {
    menuItems = userRole ? MENU_ITEMS[userRole] : [];
  }

  return (
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
              type="button"
              className={styles.notificationButton}
              aria-label="알림"
              onClick={() => setIsNotificationOpen((isOpen) => !isOpen)}
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
                  onClose={() => setIsNotificationOpen(false)}
                  onNotificationClick={onNotificationClick}
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
          <ProfileMenu userRole={userRole} nickname={nickname} onLogout={onLogout} />
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

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        isLoggedIn={isLoggedIn}
        menuItems={menuItems}
      />
    </header>
  );
}
