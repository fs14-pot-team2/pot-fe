import Image from "next/image";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button/Button";
import styles from "./QuoteCard.module.css";

interface BaseQuoteCardProps {
  tags?: ReactNode;
  status?: ReactNode;
  isConfirmed?: boolean;
  price?: number;
  className?: string;
}

interface OwnerQuoteCardProps extends BaseQuoteCardProps {
  variant: "owner";
  comment: string;
  sitter: {
    nickname: string;
    profileImage?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    confirmedCount?: number | null;
    gender?: string | null;
  };
  onDetailClick?: () => void;
  onConfirmClick?: () => void;
}

interface SitterQuoteCardProps extends BaseQuoteCardProps {
  variant: "sitter";
  ownerNickname: string;
  startDate: string;
  endDate: string;
  location: string;
  onDetailClick?: never;
  onConfirmClick?: never;
}

type QuoteCardProps = OwnerQuoteCardProps | SitterQuoteCardProps;

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

export default function QuoteCard(props: QuoteCardProps) {
  const { variant, tags, status, isConfirmed = false, price, className = "" } = props;

  return (
    <article
      className={[
        styles.card,
        variant === "owner" ? styles.ownerCard : styles.sitterCard,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.top}>
        <div className={styles.tags}>{tags}</div>

        {isConfirmed ? (
          <div className={styles.confirmedStatus}>
            <Image src="/icons/ic_confirm.svg" alt="" width={16} height={16} />
            <span>확정견적</span>
          </div>
        ) : (
          status && <div className={styles.status}>{status}</div>
        )}
      </div>

      {variant === "owner" ? (
        <>
          <p className={styles.comment}>{props.comment}</p>

          <div className={styles.sitterProfile}>
            <div className={styles.avatar}>
              <Image
                src={props.sitter.profileImage || "/icons/no_img.svg"}
                alt={`${props.sitter.nickname} 프로필 이미지`}
                fill
                sizes="48px"
                className={styles.avatarImage}
              />
            </div>

            <div className={styles.sitterInfo}>
              <div className={styles.nicknameWrap}>
                <Image
                  src="/icons/ic_sitter.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={styles.sitterIcon}
                />

                <p className={styles.nickname}>{props.sitter.nickname}</p>
              </div>

              <div className={styles.meta}>
                <span className={styles.rating}>
                  <Image
                    src="/icons/ic_star.svg"
                    alt=""
                    width={14}
                    height={14}
                    className={styles.star}
                  />

                  <span className={styles.ratingValue}>
                    {(props.sitter.rating ?? 0).toFixed(1)}
                  </span>

                  <span className={styles.reviewCount}>({props.sitter.reviewCount ?? 0})</span>
                </span>

                {props.sitter.gender && (
                  <span className={styles.gender}>{props.sitter.gender}</span>
                )}

                <span className={styles.confirmedCount}>
                  <span className={styles.confirmedValue}>
                    {props.sitter.confirmedCount ?? 0}건
                  </span>

                  <span className={styles.confirmedLabel}>확정</span>
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className={styles.ownerNickname}>{props.ownerNickname} 팟오너</p>

          <div className={styles.careInfo}>
            <div className={styles.dateWrap}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>시작일</span>
                <strong>{props.startDate}</strong>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>종료일</span>
                <strong>{props.endDate}</strong>
              </div>
            </div>
            <div className={styles.locationWrap}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>돌봄 장소</span>
                <strong>{props.location}</strong>
              </div>
            </div>
          </div>
        </>
      )}

      {price != null && (
        <div className={styles.priceWrap}>
          <span className={styles.priceLabel}>견적가</span>
          <strong className={styles.price}>{formatPrice(price)}</strong>
        </div>
      )}

      {variant === "owner" && (props.onDetailClick || (!isConfirmed && props.onConfirmClick)) && (
        <div className={styles.buttonWrap}>
          {props.onDetailClick && (
            <Button variant="outlined" size="md" onClick={props.onDetailClick}>
              상세보기
            </Button>
          )}

          {!isConfirmed && props.onConfirmClick && (
            <Button variant="solid" size="md" onClick={props.onConfirmClick}>
              견적 확정하기
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
