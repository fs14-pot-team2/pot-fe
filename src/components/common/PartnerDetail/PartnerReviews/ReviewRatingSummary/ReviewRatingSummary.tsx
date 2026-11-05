import type { PartnerReviewSummary } from "@/types/partner";
import Image from "next/image";
import RatingDistribution from "../RatingDistribution/RatingDistribution";
import styles from "./ReviewRatingSummary.module.css";

type ReviewRatingSummaryProps = {
  summary: PartnerReviewSummary;
};

const stars = [1, 2, 3, 4, 5];

export default function ReviewRatingSummary({ summary }: ReviewRatingSummaryProps) {
  const fillPercentage = Math.max(0, Math.min(100, (summary.averageRating / 5) * 100));

  return (
    <section className={styles.summary} aria-label="리뷰 평점 현황">
      <div className={styles.average}>
        <div className={styles.score}>
          <strong>{summary.averageRating.toFixed(1)}</strong>
          <span>/ 5</span>
        </div>

        <div className={styles.stars} aria-hidden="true">
          <div className={styles.starRow}>
            {stars.map((star) => (
              <Image key={star} src="/icons/ic_star_default.svg" alt="" width={32} height={32} />
            ))}
          </div>

          <div className={styles.filledStars} style={{ width: `${fillPercentage}%` }}>
            <div className={styles.starRow}>
              {stars.map((star) => (
                <Image key={star} src="/icons/ic_star.svg" alt="" width={32} height={32} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <RatingDistribution summary={summary} />
    </section>
  );
}
