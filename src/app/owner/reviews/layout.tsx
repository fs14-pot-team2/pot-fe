"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Toggle from "@/components/ui/Toggle/Toggle";
import styles from "./layout.module.css";

const REVIEW_TABS = [
  { label: "작성 가능한 리뷰", value: "available" },
  { label: "내가 작성한 리뷰", value: "written" },
];

export default function ReviewsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = pathname.startsWith("/owner/reviews/written") ? "written" : "available";

  return (
    <>
      <div className={styles.tabsBar}>
        <div className="container">
          <nav className={styles.tabsNav} aria-label="리뷰 메뉴">
            <Toggle
              options={REVIEW_TABS}
              value={activeTab}
              onChange={(value) => {
                router.push(`/owner/reviews/${value}`);
              }}
              className={styles.tabs}
            />
          </nav>
        </div>
      </div>

      {children}
    </>
  );
}
