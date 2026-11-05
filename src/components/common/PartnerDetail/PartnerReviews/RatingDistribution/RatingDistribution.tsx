import type { PartnerReviewSummary } from "@/types/partner";
import styles from "./RatingDistribution.module.css";

type RatingDistributionProps = {
  summary: PartnerReviewSummary;
};

const ratings = ["5", "4", "3", "2", "1"] as const;

export default function RatingDistribution({ summary }: RatingDistributionProps) {
  return (
    <div className={styles.distribution} aria-label="별점별 리뷰 분포">
      {ratings.map((rating) => {
        const count = summary.ratingDistribution[rating];
        const percentage = summary.reviewCount > 0 ? (count / summary.reviewCount) * 100 : 0;

        return (
          <div key={rating} className={styles.row}>
            <span className={styles.label}>{rating}점</span>

            <div className={styles.track} aria-hidden="true">
              <div className={styles.fill} style={{ width: `${percentage}%` }} />
            </div>

            <span className={styles.count}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}
