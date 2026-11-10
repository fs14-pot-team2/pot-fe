"use client";

import Image from "next/image";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

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
  comment?: string;
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
  onMessageClick?: () => void;

  onEditClick?: never;
  requestStatus?: never;
  isCompleted?: never;
  onCompletedDetailClick?: never;
}

// 반려된 지정 요청
type RejectedOwnerProps = {
  status: "rejected";
  onRejectReasonClick: () => void;
};

// 일반 견적
type DefaultOwnerProps = {
  status?: Exclude<QuoteStatusType, "rejected">;
  onRejectReasonClick?: never;
};

type OwnerQuoteCardProps = BaseOwnerQuoteCardProps & (RejectedOwnerProps | DefaultOwnerProps);

// 기존 완료 카드 사용처 호환
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

  requestStatus?: SitterRequestStatus;

  onDetailClick?: () => void;
  onEditClick?: () => void;

  onConfirmClick?: never;
  onMessageClick?: never;
}

type SitterQuoteCardProps = BaseSitterQuoteCardProps & (CompletedProps | DefaultProps);

type QuoteCardProps = OwnerQuoteCardProps | SitterQuoteCardProps;

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

export default function QuoteCard(props: QuoteCardProps) {
  const { variant, tags, status, price, className = "" } = props;

  // 팟오너: 대기 견적만 확정 가능
  const canConfirm = status === "waiting";

  // 팟트너: OPEN 요청에서만 수정 가능
  const isSitterOpen = variant === "sitter" && props.requestStatus === "OPEN";

  // 팟트너: 확정 또는 만료된 요청
  const isSitterClosed =
    variant === "sitter" &&
    (props.requestStatus === "MATCHED" ||
      props.requestStatus === "EXPIRED" ||
      props.isCompleted === true);

  // 기존 완료 카드 콜백도 지원
  const sitterDetailClick =
    variant === "sitter"
      ? (props.onDetailClick ?? (props.isCompleted ? props.onCompletedDetailClick : undefined))
      : undefined;

  // OPEN 상태에서만 카드 전체 클릭 허용
  const isSitterClickable =
    variant === "sitter" && isSitterOpen && !isSitterClosed && Boolean(sitterDetailClick);

  const handleCardClick = () => {
    if (!isSitterClickable) return;

    sitterDetailClick?.();
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  };

  // 수정 아이콘 클릭 시 상세보기 이벤트 실행 방지
  const handleEditClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (variant === "sitter") {
      props.onEditClick?.();
    }
  };

  const cardClassName = [
    styles.card,
    variant === "owner" ? styles.ownerCard : styles.sitterCard,
    isSitterClickable ? styles.clickableCard : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={cardClassName}
      onClick={isSitterClickable ? handleCardClick : undefined}
      onKeyDown={isSitterClickable ? handleCardKeyDown : undefined}
      role={isSitterClickable ? "link" : undefined}
      tabIndex={isSitterClickable ? 0 : undefined}
      aria-label={isSitterClickable ? `${props.ownerNickname} 팟오너 견적 상세보기` : undefined}
    >
      {/* 카드 상단 */}
      <div className={styles.top}>
        <div className={styles.tags}>{tags}</div>

        {variant === "sitter" ? (
          <div className={styles.topActions}>
            {/* 팟트너 견적 상태 유지 */}
            {status && <QuoteStatus status={status} />}

            {/* OPEN 상태에서만 수정 아이콘 표시 */}
            {isSitterOpen && !isSitterClosed && props.onEditClick && (
              <button
                type="button"
                className={styles.editButton}
                onClick={handleEditClick}
                aria-label="견적 수정하기"
                title="견적 수정하기"
              >
                <Image src="/icons/ic_edit.svg" alt="" width={24} height={24} />
              </button>
            )}
          </div>
        ) : (
          /* 팟오너: 견적 상태 대신 쪽지 아이콘 */
          <button
            type="button"
            className={styles.messageButton}
            disabled={!props.onMessageClick}
            onClick={(event) => {
              event.stopPropagation();
              props.onMessageClick?.();
            }}
            aria-label="쪽지 보내기"
            title={props.onMessageClick ? "쪽지 보내기" : "쪽지 기능 연결 전"}
          >
            <Image src="/icons/ic_message.svg" alt="" width={24} height={24} />
          </button>
        )}
      </div>

      {/* 팟오너: 팟트너 정보 */}
      {variant === "owner" ? (
        <>
          {props.comment && <p className={styles.comment}>{props.comment}</p>}

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
        /* 팟트너: 팟오너 및 돌봄 정보 */
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

      {/* 견적 금액 */}
      {price != null && (
        <div className={styles.priceWrap}>
          <span className={styles.priceLabel}>견적가</span>

          <strong className={styles.price}>{formatPrice(price)}</strong>
        </div>
      )}

      {/* 팟오너: 기존 상세보기 / 확정 / 반려 버튼 유지 */}
      {variant === "owner" &&
        (props.onDetailClick ||
          (canConfirm && props.onConfirmClick) ||
          props.status === "rejected") && (
          <div className={styles.buttonWrap}>
            {props.status === "rejected" ? (
              <Button
                type="button"
                variant="outlined"
                size="md"
                onClick={props.onRejectReasonClick}
              >
                반려 사유 확인
              </Button>
            ) : (
              <>
                {props.onDetailClick && (
                  <Button type="button" variant="outlined" size="md" onClick={props.onDetailClick}>
                    상세보기
                  </Button>
                )}

                {canConfirm && props.onConfirmClick && (
                  <Button type="button" variant="solid" size="md" onClick={props.onConfirmClick}>
                    견적 확정하기
                  </Button>
                )}
              </>
            )}
          </div>
        )}

      {/* 팟트너: 마감된 견적은 오버레이 버튼으로만 상세 이동 */}
      {variant === "sitter" && isSitterClosed && (
        <CardStatusOverlay
          message="돌봄 요청이 마감되었습니다"
          action={
            sitterDetailClick
              ? {
                  label: "견적 상세보기",
                  onClick: sitterDetailClick,
                }
              : undefined
          }
        />
      )}
    </article>
  );
}
