"use client";

import { useState } from "react";
import { formatDateOnly } from "@/utils/dateFormat";
import { useRejectedRequestReason } from "@/features/care-requests/owner/hooks/useCareRequests";

import CareInfo from "@/components/common/CareInfo/CareInfo";
import QuoteCard from "@/components/common/QuoteCard/QuoteCard";
import Tag from "@/components/ui/Tag/Tag";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import CheckBox from "@/components/ui/CheckBox/CheckBox";

import styles from "./MyQuoteManagement.module.css";

type CareType = "SHORT_CARE" | "REGULAR_CARE";

export type RequestStatus = "OPEN" | "MATCHED" | "EXPIRED";

type QuoteStatus = "waiting" | "confirmed" | "rejected" | "expired";

export interface MyQuoteCareInfo {
  createdAt: string;
  serviceType: CareType;
  startDate: string;
  endDate: string;
  location: string;
}

export interface MyQuoteItem {
  id: string;
  status: QuoteStatus;
  comment: string;
  price?: number;
  designatedRequestId: string | null;
  rejectedRequestId: string | null;
  sitter: {
    nickname: string;
    profileImage?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    confirmedCount?: number | null;
    gender?: string | null;
  };
}

interface MyQuoteManagementProps {
  variant?: "active" | "history";
  requestId: string;
  careInfo: MyQuoteCareInfo;
  requestStatus: RequestStatus;
  quotes: MyQuoteItem[];
  canEdit: boolean;
  onEdit: (requestId: string) => void;
  onDelete: (requestId: string) => Promise<void>;
  onQuoteDetail?: (quoteId: string) => void;
  onQuoteConfirm?: (quoteId: string) => void;
  className?: string;
}

export default function MyQuoteManagement({
  variant = "active",
  requestId,
  careInfo,
  requestStatus,
  quotes,
  canEdit,
  onEdit,
  onDelete,
  onQuoteDetail,
  onQuoteConfirm,
  className = "",
}: MyQuoteManagementProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [selectedRejectedQuote, setSelectedRejectedQuote] = useState<MyQuoteItem | null>(null);

  const {
    data: rejectedReasonData,
    isPending: isRejectedReasonPending,
    isError: isRejectedReasonError,
  } = useRejectedRequestReason(selectedRejectedQuote?.rejectedRequestId);

  // 받았던 견적에서만 사용하는 체크박스 상태
  const [showConfirmedOnly, setShowConfirmedOnly] = useState(false);

  const isHistory = variant === "history";
  const isOpen = requestStatus === "OPEN";

  // 받았던 견적에서는 수정·삭제 버튼을 표시하지 않음
  const showEdit = !isHistory && isOpen && canEdit;
  const showDelete = !isHistory && isOpen;

  // 체크 시 확정 견적만 표시
  const visibleQuotes =
    isHistory && showConfirmedOnly
      ? quotes.filter((quote) => quote.status === "confirmed")
      : quotes;

  const formattedStartDate = formatDateOnly(careInfo.startDate, "korean");
  const formattedEndDate = formatDateOnly(careInfo.endDate, "korean");

  const openDeleteModal = () => {
    setDeleteError(false);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;

    setDeleteError(false);
    setIsDeleteModalOpen(false);
  };

  const openRejectReasonModal = (quote: MyQuoteItem) => {
    if (!quote.rejectedRequestId) {
      return;
    }

    setSelectedRejectedQuote(quote);
  };

  const closeRejectReasonModal = () => {
    setSelectedRejectedQuote(null);
  };

  const confirmDelete = async () => {
    if (!showDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(false);

    try {
      await onDelete(requestId);
      setIsDeleteModalOpen(false);
    } catch {
      setDeleteError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const wrapperClassName = [styles.wrapper, className].filter(Boolean).join(" ");

  return (
    <>
      <section className={wrapperClassName} aria-label={`돌봄 요청 ${requestId} 견적 관리`}>
        {/* 돌봄 정보 */}
        <div className={styles.careInfoArea}>
          <CareInfo
            className={styles.careInfo}
            variant="summary"
            createdAt={careInfo.createdAt}
            serviceType={careInfo.serviceType}
            startDate={careInfo.startDate}
            endDate={careInfo.endDate}
            location={careInfo.location}
            canEdit={showEdit}
            onEdit={() => onEdit(requestId)}
            canCancel={showDelete}
            onCancel={openDeleteModal}
          />
        </div>

        {/* 견적서 목록 */}
        <div className={styles.quoteArea}>
          <header className={styles.quoteHeader}>
            <h3 className={styles.quoteTitle}>
              견적서 목록
              <span className={styles.quoteCount}>{quotes.length}</span>
            </h3>
          </header>

          {/* 받았던 견적에서만 체크박스 표시 */}
          {isHistory && (
            <div className={styles.historyFilter}>
              <CheckBox
                checked={showConfirmedOnly}
                onChange={setShowConfirmedOnly}
                label="확정 견적만 보기"
              />
            </div>
          )}

          {visibleQuotes.length === 0 ? (
            <EmptyState
              className={styles.emptyState}
              messages={
                isHistory && showConfirmedOnly
                  ? ["확정된 견적서가 없어요."]
                  : ["아직 도착한 견적서가 없어요."]
              }
            />
          ) : (
            <div className={styles.quoteList}>
              {visibleQuotes.map((quote) => {
                const tags =
                  quote.designatedRequestId !== null ? (
                    <Tag variant="designated" size="md" />
                  ) : undefined;

                // 반려된 지정 요청
                if (quote.status === "rejected") {
                  return (
                    <QuoteCard
                      key={quote.id}
                      className={styles.quoteCard}
                      variant="owner"
                      status="rejected"
                      tags={tags}
                      comment={quote.comment}
                      sitter={quote.sitter}
                      onRejectReasonClick={() => openRejectReasonModal(quote)}
                    />
                  );
                }

                return (
                  <QuoteCard
                    key={quote.id}
                    className={styles.quoteCard}
                    variant="owner"
                    status={quote.status}
                    tags={tags}
                    comment={quote.comment}
                    price={quote.price}
                    sitter={quote.sitter}
                    onDetailClick={onQuoteDetail ? () => onQuoteDetail(quote.id) : undefined}
                    onConfirmClick={
                      !isHistory && isOpen && quote.status === "waiting" && onQuoteConfirm
                        ? () => onQuoteConfirm(quote.id)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 요청한 견적 현황에서만 삭제 모달 사용 */}
      {!isHistory && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          title="돌봄 요청 삭제"
          footer={
            <div className={styles.modalActions}>
              <Button
                variant="outlined"
                className={styles.modalButton}
                disabled={isDeleting}
                onClick={closeDeleteModal}
              >
                취소
              </Button>

              <Button
                variant="solid"
                className={styles.modalButton}
                disabled={isDeleting}
                onClick={confirmDelete}
              >
                {isDeleting ? "삭제 중..." : "삭제하기"}
              </Button>
            </div>
          }
        >
          <p className={styles.modalDescription}>
            돌봄 요청을 삭제하시겠어요?
            <br />
            삭제한 요청은 복구할 수 없습니다.
          </p>

          {deleteError && (
            <p className={styles.errorMessage} role="alert">
              삭제하지 못했어요. 다시 시도해 주세요.
            </p>
          )}
        </Modal>
      )}
      <Modal
        isOpen={selectedRejectedQuote !== null}
        onClose={closeRejectReasonModal}
        title="반려 사유 확인"
        className={styles.rejectReasonModal}
      >
        {selectedRejectedQuote && (
          <div className={styles.rejectReasonContent}>
            <div className={styles.rejectReasonTags}>
              <Tag variant="request" serviceType={careInfo.serviceType} size="md" />
              <Tag variant="designated" size="md" />
            </div>

            <strong className={styles.rejectReasonNickname}>
              {selectedRejectedQuote.sitter.nickname} 팟트너
            </strong>

            <div className={styles.rejectReasonInfo}>
              <div className={styles.rejectReasonDates}>
                <div className={styles.rejectReasonInfoItem}>
                  <span>시작일</span>
                  <strong>{formattedStartDate}</strong>
                </div>

                <div className={styles.rejectReasonInfoItem}>
                  <span>종료일</span>
                  <strong>{formattedEndDate}</strong>
                </div>
              </div>

              <div className={styles.rejectReasonLocation}>
                <div className={styles.rejectReasonInfoItem}>
                  <span>돌봄 장소</span>
                  <strong>{careInfo.location}</strong>
                </div>
              </div>
            </div>

            <div className={styles.rejectReasonBody}>
              <h3>반려 사유</h3>
              <p>
                {isRejectedReasonPending
                  ? "반려 사유를 불러오는 중입니다."
                  : isRejectedReasonError
                    ? "반려 사유를 불러오지 못했습니다."
                    : rejectedReasonData?.reason}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
