"use client";

import { formatDateOnly, formatDateTimeKst } from "@/utils/dateFormat";
import Button from "@/components/ui/Button/Button";
import styles from "./CareInfo.module.css";
import Image from "next/image";
import IconButton from "@/components/ui/IconButton/IconButton";

type CareInfoProps = {
  variant?: "summary" | "detail";
  createdAt: string;
  serviceType: "SHORT_CARE" | "REGULAR_CARE";
  startDate: string;
  endDate: string;
  location: string;
  locationNotice?: string; // 일부 주소에 대한 안내문구
  canEdit?: boolean;
  canCancel?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  className?: string;
};

const SERVICE_TYPE_LABEL = {
  SHORT_CARE: "잠깐만 돌봄",
  REGULAR_CARE: "꾸준히 돌봄",
} as const;

export default function CareInfo(props: CareInfoProps) {
  const variant = props.variant ?? "summary";
  const isDetail = variant === "detail";

  const requestedDate = formatDateTimeKst(props.createdAt, "dots");
  const formattedStartDate = formatDateOnly(props.startDate, "korean");
  const formattedEndDate = formatDateOnly(props.endDate, "korean");

  const serviceTypeLabel = SERVICE_TYPE_LABEL[props.serviceType];

  const editAction = props.canEdit ? props.onEdit : undefined;
  const cancelAction = props.canCancel ? props.onCancel : undefined;
  const hasAction = Boolean(editAction || cancelAction);

  const careInfoClassName = [styles.container, styles[variant], props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={careInfoClassName}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>
            <span className={styles.defaultTitle}>돌봄 정보</span>

            {!isDetail && <span className={styles.compactTitle}>{serviceTypeLabel}</span>}
          </h2>

          {!isDetail && (
            <div className={styles.compactRequestedDate}>
              <span>돌봄 요청일</span>
              <time dateTime={props.createdAt}> {requestedDate}</time>
            </div>
          )}
        </div>

        {!isDetail && (
          <div className={styles.headerMeta}>
            <time className={styles.requestedDate} dateTime={props.createdAt}>
              {requestedDate}
            </time>

            {hasAction && (
              <div className={styles.compactActions}>
                {editAction && (
                  <IconButton
                    className={styles.compactActionButton}
                    aria-label="돌봄 요청 수정"
                    onClick={editAction}
                  >
                    <Image src="/icons/ic_edit.svg" alt="" width={24} height={24} />
                  </IconButton>
                )}

                {cancelAction && (
                  <IconButton
                    className={styles.compactActionButton}
                    aria-label="돌봄 요청 삭제"
                    onClick={cancelAction}
                  >
                    <Image src="/icons/ic_delete.svg" alt="" width={24} height={24} />
                  </IconButton>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      <dl className={styles.details}>
        {isDetail && (
          <div className={styles.detailRow}>
            <dt className={styles.label}>돌봄 요청일</dt>
            <dd className={styles.value}>
              <time dateTime={props.createdAt}>{requestedDate}</time>
            </dd>
          </div>
        )}
        <div className={`${styles.detailRow} ${styles.serviceTypeRow}`}>
          <dt className={styles.label}>돌봄 방식</dt>
          <dd className={styles.value}>{serviceTypeLabel}</dd>
        </div>
        <div className={styles.detailRow}>
          <dt className={styles.label}>돌봄 시작일</dt>
          <dd className={styles.value}>
            <time dateTime={props.startDate}>{formattedStartDate}</time>
          </dd>
        </div>

        <div className={styles.detailRow}>
          <dt className={styles.label}>돌봄 종료일</dt>
          <dd className={styles.value}>
            <time dateTime={props.endDate}>{formattedEndDate}</time>
          </dd>
        </div>

        <div className={styles.detailRow}>
          <dt className={styles.label}>돌봄 장소</dt>
          <dd className={styles.value}>
            {props.location}

            {isDetail && props.locationNotice && (
              <small className={styles.notice}>{props.locationNotice}</small>
            )}
          </dd>
        </div>
      </dl>

      {!isDetail && hasAction && (
        <div className={styles.actions}>
          {editAction && (
            <Button className={styles.actionButton} variant="outlined" onClick={editAction}>
              수정
            </Button>
          )}

          {cancelAction && (
            <Button className={styles.actionButton} variant="solid" onClick={cancelAction}>
              삭제
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
