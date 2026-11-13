import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import Tag from "@/components/ui/Tag/Tag";
import type { WrittenReviewItem } from "@/features/reviews/types/review";
import { formatDateOnly, formatDateTimeKst } from "@/utils/dateFormat";
import Image from "next/image";
import styles from "./WrittenReviewCard.module.css";

type WrittenReviewCardProps = {
  item: WrittenReviewItem;
  onEdit: (item: WrittenReviewItem) => void;
  onDelete: (item: WrittenReviewItem) => void;
};

export default function WrittenReviewCard({ item, onEdit, onDelete }: WrittenReviewCardProps) {
  const { review, careRequest, confirmedQuote, sitter } = item;

  const formattedDate = formatDateOnly(careRequest.endDate, "dots");
  const formattedPrice = `${confirmedQuote.price.toLocaleString("ko-KR")}원`;
  const formattedCreatedAt = formatDateTimeKst(review.createdAt, "dots");

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.tags}>
          <Tag variant="request" serviceType={careRequest.serviceType} />

          {confirmedQuote.type === "DESIGNATED" && <Tag variant="designated" />}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="리뷰 수정"
            onClick={() => onEdit(item)}
          >
            <Image src="/icons/ic_edit.svg" alt="" width={19} height={19} />
          </button>

          <button
            type="button"
            className={styles.iconButton}
            aria-label="리뷰 삭제"
            onClick={() => onDelete(item)}
          >
            <Image src="/icons/ic_delete.svg" alt="" width={24} height={24} />
          </button>
        </div>
      </div>

      <div className={styles.sitterInfo}>
        <ProfileImage
          src={sitter.profileImageUrl}
          alt={`${sitter.nickname} 프로필 이미지`}
          sizes="(max-width: 768px) 48px, (max-width: 1200px) 64px, 100px"
          className={styles.avatar}
        />

        <div className={styles.details}>
          <p className={styles.nickname}>{sitter.nickname} 팟트너</p>

          <div className={styles.meta}>
            <span>
              <span className={styles.label}>종료일</span>
              {formattedDate}
            </span>
            <span>
              <span className={styles.label}>견적가</span>
              {formattedPrice}
            </span>
          </div>

          <div
            className={styles.rating}
            role="img"
            aria-label={`별점 5점 만점에 ${review.rating}점`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Image
                key={star}
                src={star <= review.rating ? "/icons/ic_star.svg" : "/icons/ic_star_default.svg"}
                alt=""
                width={20}
                height={20}
              />
            ))}
          </div>
        </div>
      </div>

      <p className={styles.reviewContent}>{review.content}</p>

      <p className={styles.createdAt}>작성일 {formattedCreatedAt}</p>
    </article>
  );
}
