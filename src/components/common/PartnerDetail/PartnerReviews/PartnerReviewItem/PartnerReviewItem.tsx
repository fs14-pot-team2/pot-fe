import type { PartnerReviewItem as PartnerReviewItemData } from "@/types/partner";
import { formatDateTimeKst } from "@/utils/dateFormat";
import Image from "next/image";
import styles from "./PartnerReviewItem.module.css";

type PartnerReviewItemProps = {
  item: PartnerReviewItemData;
};

const stars = [1, 2, 3, 4, 5];

export default function PartnerReviewItem({ item }: PartnerReviewItemProps) {
  const { review, owner } = item;
  const formattedDate = formatDateTimeKst(review.createdAt, "hyphen");

  return (
    <article className={styles.item}>
      <div className={styles.header}>
        <span className={styles.nickname}>{owner.nickname}</span>
        <span className={styles.divider} aria-hidden="true" />
        <time className={styles.date} dateTime={review.createdAt}>
          {formattedDate}
        </time>
      </div>

      <div className={styles.stars} aria-label={`별점 ${review.rating}점`}>
        {stars.map((star) => (
          <Image
            key={star}
            src={star <= review.rating ? "/icons/ic_star.svg" : "/icons/ic_star_default.svg"}
            alt=""
            width={14}
            height={14}
          />
        ))}
      </div>

      <p className={styles.content}>{review.content}</p>
    </article>
  );
}
