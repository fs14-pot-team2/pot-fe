"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import PageContainer from "@/components/layout/Page/PageContainer";
import PageMain from "@/components/layout/Page/PageMain";
import Toggle from "@/components/ui/Toggle/Toggle";

import styles from "../page.module.css";

const QUOTE_TABS = [
  { label: "요청한 견적 현황", value: "active" },
  { label: "받았던 견적", value: "history" },
];

interface OwnerQuotesLayoutProps {
  children: ReactNode;
}

export default function OwnerQuotesLayout({ children }: OwnerQuotesLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.replace(/\/$/, "") === "/owner/quotes/history" ? "history" : "active";

  const handleTabChange = (value: string) => {
    if (value === activeTab) return;

    if (value === "active") {
      router.push("/owner/quotes");
    } else if (value === "history") {
      router.push("/owner/quotes/history");
    }
  };

  return (
    <PageMain>
      <PageContainer>
        <div className={styles.content}>
          <nav className={styles.tabsNav} aria-label="견적 내역 메뉴">
            <Toggle
              className={styles.tabs}
              variant="default"
              options={QUOTE_TABS}
              value={activeTab}
              onChange={handleTabChange}
            />
          </nav>

          <div className={styles.pageContent}>{children}</div>
        </div>
      </PageContainer>
    </PageMain>
  );
}
