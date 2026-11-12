"use client";

import Button from "@/components/ui/Button/Button";
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import Tag from "@/components/ui/Tag/Tag";
import { formatDateOnly } from "@/utils/dateFormat";
import styles from "./ReviewWriteCard.module.css";

export type ReviewWriteTarget = {
  careRequest: {
    id: string;
    serviceType: "SHORT_CARE" | "REGULAR_CARE";
    endDate: string;
  };
  confirmedQuote: {
    id: string;
    type: "GENERAL" | "DESIGNATED";
    price: number;
  };
  sitter: {
    id: string;
    nickname: string;
    profileImageUrl: string | null;
  };
};

type ReviewWriteCardProps = {
  reviewTarget: ReviewWriteTarget;
  onWrite: (reviewTarget: ReviewWriteTarget) => void;
  className?: string;
};

export default function ReviewWriteCard({
  reviewTarget,
  onWrite,
  className = "",
}: ReviewWriteCardProps) {
  const { careRequest, confirmedQuote, sitter } = reviewTarget;

  const isDesignated = confirmedQuote.type === "DESIGNATED";
  const formattedDate = formatDateOnly(careRequest.endDate, "dots");
  const formattedPrice = `${confirmedQuote.price.toLocaleString("ko-KR")}원`;

  return (
    <article className={`${styles.card} ${className}`}>
      <div className={styles.tags}>
        <Tag variant="request" serviceType={careRequest.serviceType} />
        {isDesignated && <Tag variant="designated" />}
      </div>

      <div className={styles.sitterInfo}>
        <ProfileImage
          src={sitter.profileImageUrl}
          alt={`${sitter.nickname} 프로필 이미지`}
          sizes="(max-width: 768px) 48px, 100px"
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
        </div>
      </div>

      <Button className={styles.writeButton} onClick={() => onWrite(reviewTarget)}>
        리뷰 작성하기
      </Button>
    </article>
  );
}
