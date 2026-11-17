import cardStyles from "@/components/common/QuoteCard/QuoteCard.module.css";
import buttonStyles from "@/components/ui/Button/Button.module.css";
import Tag from "@/components/ui/Tag/Tag";
import Image from "next/image";
import styles from "./QuoteSection.module.css";

export default function QuotePreview() {
  return (
    <article className={`${cardStyles.card} ${cardStyles.ownerCard}`}>
      <div className={cardStyles.top}>
        <div className={cardStyles.tags}>
          <Tag variant="designated" size="md" />
        </div>

        <span className={`${cardStyles.messageButton} ${styles.previewControl}`}>
          <Image src="/icons/ic_message.svg" alt="쪽지 보내기" width={24} height={24} />
        </span>
      </div>

      <p className={cardStyles.comment}>식물마다 필요한 돌봄을 꼼꼼히 살펴요.</p>

      <div className={cardStyles.sitterProfile}>
        <div className={cardStyles.avatar}>
          <Image
            src="/images/landing/partner-quote-female.png"
            alt="풀타임 예시 프로필 사진"
            fill
            sizes="48px"
            className={cardStyles.avatarImage}
          />
        </div>

        <div className={cardStyles.sitterInfo}>
          <div className={cardStyles.nicknameWrap}>
            <Image
              src="/icons/ic_sitter.svg"
              alt=""
              width={16}
              height={16}
              className={cardStyles.sitterIcon}
            />
            <p className={cardStyles.nickname}>풀타임</p>
          </div>

          <div className={cardStyles.meta}>
            <span className={cardStyles.rating}>
              <Image
                src="/icons/ic_star.svg"
                alt=""
                width={14}
                height={14}
                className={cardStyles.star}
              />
              <span className={cardStyles.ratingValue}>4.8</span>
              <span className={cardStyles.reviewCount}>(96)</span>
            </span>

            <span className={cardStyles.gender}>여성</span>
            <span className={cardStyles.confirmedCount}>
              <span className={cardStyles.confirmedValue}>124건</span>
              <span className={cardStyles.confirmedLabel}>확정</span>
            </span>
          </div>
        </div>
      </div>

      <div className={cardStyles.priceWrap}>
        <span className={cardStyles.priceLabel}>견적가</span>
        <strong className={cardStyles.price}>50,000원</strong>
      </div>

      <div className={`${cardStyles.buttonWrap} ${styles.previewButtons}`}>
        <span
          className={`${buttonStyles.button} ${buttonStyles.outlined} ${buttonStyles.md} ${styles.previewControl}`}
        >
          상세보기
        </span>
        <span
          className={`${buttonStyles.button} ${buttonStyles.solid} ${buttonStyles.md} ${styles.previewControl}`}
        >
          견적 확정하기
        </span>
      </div>
    </article>
  );
}
