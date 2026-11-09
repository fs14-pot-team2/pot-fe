"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button/Button";
import CardStatusOverlay from "@/components/ui/CardStatusOverlay/CardStatusOverlay";
import QuoteStatus, { type QuoteStatusType } from "@/components/ui/QuoteStatus/QuoteStatus";

import styles from "./QuoteCard.module.css";

type SitterRequestStatus = "OPEN" | "MATCHED" | "EXPIRED";

interface BaseQuoteCardProps {
  tags?: ReactNode;
  status?: QuoteStatusType;
  price?: number;
  className?: string;
}

interface BaseOwnerQuoteCardProps extends BaseQuoteCardProps {
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
  onEditClick?: never;
  requestStatus?: never;
  isCompleted?: never;
  onCompletedDetailClick?: never;
}

// 반려 상태에서는 반려 사유 확인 콜백 필수
type RejectedOwnerProps = {
  status: "rejected";
  onRejectReasonClick: () => void;
};

// 일반 견적에서는 반려 사유 확인 콜백 사용 불가
type DefaultOwnerProps = {
  status?: Exclude<QuoteStatusType, "rejected">;
  onRejectReasonClick?: never;
};

type OwnerQuoteCardProps = BaseOwnerQuoteCardProps & (RejectedOwnerProps | DefaultOwnerProps);

// 기존 완료 카드 사용처 호환성 유지
type CompletedProps = {
  isCompleted: true;
  onCompletedDetailClick: () => void;
};

type DefaultProps = {
  isCompleted?: false;
  onCompletedDetailClick?: never;
};

interface BaseSitterQuoteCardProps extends BaseQuoteCardProps {
  variant: "sitter";
  ownerNickname: string;
  startDate: string;
  endDate: string;
  location: string;

  // 돌봄 요청 상태
  requestStatus?: SitterRequestStatus;

  // 상세 조회 및 수정 모달 진입
  onDetailClick?: () => void;
  onEditClick?: () => void;

  onConfirmClick?: never;
}

type SitterQuoteCardProps = BaseSitterQuoteCardProps & (CompletedProps | DefaultProps);

type QuoteCardProps = OwnerQuoteCardProps | SitterQuoteCardProps;

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

export default function QuoteCard(props: QuoteCardProps) {
  const { variant, tags, status, price, className = "" } = props;

  // 팟오너: 견적 대기 상태에서만 확정 버튼 표시
  const canConfirm = status === "waiting";

  // 팟트너: OPEN 요청에서만 상세보기 / 수정 버튼 표시
  const isSitterOpen = variant === "sitter" && props.requestStatus === "OPEN";

  // 팟트너: 확정 / 만료 요청은 마감
  // 기존 isCompleted 사용처도 호환
  const isSitterClosed =
    variant === "sitter" &&
    (props.requestStatus === "MATCHED" ||
      props.requestStatus === "EXPIRED" ||
      props.isCompleted === true);

  const cardClassName = [
    styles.card,
    variant === "owner" ? styles.ownerCard : styles.sitterCard,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName}>
      <div className={styles.top}>
        <div className={styles.tags}>{tags}</div>

        {status && <QuoteStatus status={status} />}
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

      {/* 팟오너 버튼: 기존 동작 유지 */}
      {variant === "owner" &&
        (props.onDetailClick ||
          (canConfirm && props.onConfirmClick) ||
          props.status === "rejected") && (
          <div className={styles.buttonWrap}>
            {props.status === "rejected" ? (
              <Button variant="outlined" size="md" onClick={props.onRejectReasonClick}>
                반려 사유 확인
              </Button>
            ) : (
              <>
                {props.onDetailClick && (
                  <Button variant="outlined" size="md" onClick={props.onDetailClick}>
                    상세보기
                  </Button>
                )}

                {canConfirm && props.onConfirmClick && (
                  <Button variant="solid" size="md" onClick={props.onConfirmClick}>
                    견적 확정하기
                  </Button>
                )}
              </>
            )}
          </div>
        )}

      {/* 팟트너: OPEN 상태 버튼 */}
      {variant === "sitter" &&
        isSitterOpen &&
        !isSitterClosed &&
        (props.onDetailClick || props.onEditClick) && (
          <div className={styles.buttonWrap}>
            {props.onDetailClick && (
              <Button variant="outlined" size="md" onClick={props.onDetailClick}>
                상세보기
              </Button>
            )}

            {props.onEditClick && (
              <Button variant="solid" size="md" onClick={props.onEditClick}>
                견적 수정하기
              </Button>
            )}
          </div>
        )}

      {/* 팟트너: 확정/만료된 요청은 마감 오버레이 */}
      {variant === "sitter" && isSitterClosed && (
        <CardStatusOverlay
          message="돌봄 요청이 마감되었습니다"
          action={
            props.onDetailClick
              ? {
                  label: "견적 상세보기",
                  onClick: props.onDetailClick,
                }
              : props.isCompleted
                ? {
                    label: "견적 상세보기",
                    onClick: props.onCompletedDetailClick,
                  }
                : undefined
          }
        />
      )}
    </article>
  );
}
