import type { PartnerInfo } from "@/types/partner";
import styles from "./PartnerActivity.module.css";
import Image from "next/image";

type PartnerActivityProps = {
  partner: PartnerInfo;
};

export default function PartnerActivity({ partner }: PartnerActivityProps) {
  return (
    <section className={styles.activity} aria-label="팟트너 활동 현황">
      <div className={styles.stat}>
        <span className={styles.label}>확정</span>
        <strong className={styles.value}>
          {partner.confirmedQuoteCount.toLocaleString("ko-KR")}건
        </strong>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>리뷰</span>
        <div className={styles.rating}>
          <Image src="/icons/ic_star.svg" alt="" width={18} height={18} />
          <strong className={styles.value}>{partner.averageRating.toFixed(1)}</strong>
          <span className={styles.reviewCount}>({partner.reviewCount})</span>
        </div>
      </div>
    </section>
  );
}
