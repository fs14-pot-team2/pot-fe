import EmptyState from "@/components/ui/EmptyState/EmptyState";
import type { PartnerReviewsData } from "@/types/partner";
import type { ReactNode } from "react";
import PartnerReviewItem from "./PartnerReviewItem/PartnerReviewItem";
import styles from "./PartnerReviews.module.css";
import ReviewRatingSummary from "./ReviewRatingSummary/ReviewRatingSummary";

type PartnerReviewsProps = {
  reviews: PartnerReviewsData;
  pagination?: ReactNode;
};

export default function PartnerReviews({ reviews, pagination }: PartnerReviewsProps) {
  const hasReviews = reviews.summary.reviewCount > 0;

  return (
    <section className={styles.reviews} aria-label="팟트너 리뷰">
      <h2 className={styles.title}>리뷰 ({reviews.summary.reviewCount})</h2>

      {hasReviews ? (
        <>
          <ReviewRatingSummary summary={reviews.summary} />

          <div className={styles.list}>
            {reviews.items.map((item) => (
              <PartnerReviewItem key={item.review.id} item={item} />
            ))}
          </div>

          {pagination && <div className={styles.pagination}>{pagination}</div>}
        </>
      ) : (
        <div className={styles.empty}>
          <EmptyState messages={["아직 등록된 리뷰가 없어요!"]} />
        </div>
      )}
    </section>
  );
}
