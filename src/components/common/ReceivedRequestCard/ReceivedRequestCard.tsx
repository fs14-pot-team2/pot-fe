"use client";

import Button from "@/components/ui/Button/Button";
import CardStatusOverlay from "@/components/ui/CardStatusOverlay/CardStatusOverlay";
import Tag from "@/components/ui/Tag/Tag";
import { formatDateOnly, formatRelativeTime } from "@/utils/dateFormat";
import styles from "./ReceivedRequestCard.module.css";
import Image from "next/image";

type ServiceType = "SHORT_CARE" | "REGULAR_CARE";

type ReceivedRequest = {
  ownerNickname: string;
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  createdAt: string;
  sido: string;
  sigungu: string;
  bname?: string | null;
};

type BaseReceivedRequestCardProps = {
  request: ReceivedRequest;
  isDesignated: boolean;
  className?: string;
};

type ActiveReceivedRequestCardProps = BaseReceivedRequestCardProps & {
  displayStatus?: "active";
  onHide: () => void;
  onReject: () => void;
  onSendQuote: () => void;
};

type RejectedReceivedRequestCardProps = BaseReceivedRequestCardProps & {
  displayStatus: "rejected";
  onHide?: never;
  onReject?: never;
  onSendQuote?: never;
};

type ReceivedRequestCardProps = ActiveReceivedRequestCardProps | RejectedReceivedRequestCardProps;

export default function ReceivedRequestCard(props: ReceivedRequestCardProps) {
  const { request, isDesignated, className = "" } = props;
  const isRejected = props.displayStatus === "rejected";
  const address = [request.sido, request.sigungu, request.bname].filter(Boolean).join(" ");
  const startDateText = formatDateOnly(request.startDate, "korean");
  const endDateText = formatDateOnly(request.endDate, "korean");

  const leftButtonText = isDesignated ? "반려하기" : "숨기기";
  const cardClassNames = [styles.card, className].filter(Boolean).join(" ");

  return (
    <article className={cardClassNames}>
      <div className={styles.topRow}>
        <div className={styles.tags}>
          <Tag variant="request" serviceType={request.serviceType} size="sm" />

          {isDesignated && <Tag variant="designated" size="sm" />}
        </div>

        <time className={styles.createdAt}>{formatRelativeTime(request.createdAt)}</time>
      </div>

      <div className={styles.ownerSection}>
        <h3 className={styles.ownerName}>{request.ownerNickname} 팟오너</h3>
      </div>

      <dl className={styles.details}>
        <div className={styles.detailItem}>
          <dt className={styles.detailLabel}>시작일</dt>
          <dd className={styles.detailValue} title={startDateText}>
            {startDateText}
          </dd>
        </div>

        <div className={styles.detailItem}>
          <dt className={styles.detailLabel}>종료일</dt>
          <dd className={styles.detailValue} title={endDateText}>
            {endDateText}
          </dd>
        </div>

        <div className={styles.detailItem}>
          <dt className={styles.detailLabel}>돌봄 장소</dt>
          <dd className={styles.detailValue} title={address}>
            {address}
          </dd>
        </div>
      </dl>

      {props.displayStatus !== "rejected" && (
        <div className={styles.actions}>
          <Button
            variant="outlined"
            size="sm"
            className={styles.actionButton}
            onClick={(event) => {
              event.stopPropagation();

              const handleLeftButtonClick = isDesignated ? props.onReject : props.onHide;
              handleLeftButtonClick();
            }}
          >
            {leftButtonText}
          </Button>

          <Button
            variant="solid"
            size="sm"
            className={styles.actionButton}
            onClick={(event) => {
              event.stopPropagation();
              props.onSendQuote();
            }}
          >
            <span>견적 보내기</span>
            <Image
              className={styles.quoteIcon}
              src="/icons/ic_quote_edit.svg"
              alt=""
              width={24}
              height={24}
            />
          </Button>
        </div>
      )}

      {isRejected && <CardStatusOverlay message="반려한 요청이에요" />}
    </article>
  );
}
