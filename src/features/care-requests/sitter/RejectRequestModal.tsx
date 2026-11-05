"use client";

import { useState } from "react";

import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import Tag from "@/components/ui/Tag/Tag";
import TextArea from "@/components/ui/TextArea/TextArea";
import type { ReceivedRequestItem } from "@/types/receivedRequest";
import { formatDateOnly } from "@/utils/dateFormat";

import styles from "./RejectRequestModal.module.css";

interface RejectRequestModalProps {
  isOpen: boolean;
  request: ReceivedRequestItem["careRequest"];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RejectRequestModal({
  isOpen,
  request,
  isSubmitting = false,
  onClose,
  onSubmit,
}: RejectRequestModalProps) {
  const [reason, setReason] = useState("");

  const address = [request.sido, request.sigungu, request.bname].filter(Boolean).join(" ");
  const reasonLength = reason.replace(/\s/g, "").length;
  const isReasonValid = reasonLength >= 10 && reasonLength <= 100;

  const handleSubmit = () => {
    const trimmedReason = reason.trim();

    if (!isReasonValid) return;

    onSubmit(trimmedReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="반려요청"
      className={styles.modal}
      footer={
        <Button
          className={styles.submitButton}
          disabled={!isReasonValid || isSubmitting}
          onClick={handleSubmit}
        >
          반려하기
        </Button>
      }
    >
      <div className={styles.requestSummary}>
        <div className={styles.tags}>
          <Tag variant="request" serviceType={request.serviceType} size="sm" />
          <Tag variant="designated" size="sm" />
        </div>

        <h3 className={styles.ownerName}>{request.owner.nickname} 팟오너</h3>

        <dl className={styles.details}>
          <div>
            <dt>시작일</dt>
            <dd>{formatDateOnly(request.startDate, "korean")}</dd>
          </div>

          <div>
            <dt>종료일</dt>
            <dd>{formatDateOnly(request.endDate, "korean")}</dd>
          </div>

          <div>
            <dt>돌봄 장소</dt>
            <dd title={address}>{address}</dd>
          </div>
        </dl>
      </div>

      <TextArea
        className={styles.reasonField}
        label="반려 사유를 입력해 주세요"
        value={reason}
        placeholder="최소 10자 이상 입력해주세요"
        maxLength={100}
        disabled={isSubmitting}
        onChange={setReason}
      />
    </Modal>
  );
}
