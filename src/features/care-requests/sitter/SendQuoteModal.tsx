"use client";

import { useState } from "react";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import Tag from "@/components/ui/Tag/Tag";
import TextArea from "@/components/ui/TextArea/TextArea";

import type { ServiceType } from "@/types/receivedRequest";
import { formatDateOnly } from "@/utils/dateFormat";
import styles from "./SendQuoteModal.module.css";

export interface QuoteFormValues {
  price: number;
  comment: string;
}

interface QuoteRequestSummary {
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  sido: string;
  sigungu: string | null;
  bname: string | null;
  owner: {
    nickname: string;
  };
}

interface SendQuoteModalProps {
  isOpen: boolean;
  mode?: "create" | "edit";
  request: QuoteRequestSummary;
  initialValues?: QuoteFormValues;
  isDesignated: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: QuoteFormValues) => void;
}

export default function SendQuoteModal({
  isOpen,
  mode = "create",
  request,
  initialValues,
  isDesignated,
  isSubmitting = false,
  onClose,
  onSubmit,
}: SendQuoteModalProps) {
  const [price, setPrice] = useState(() =>
    mode === "edit" && initialValues ? String(initialValues.price) : "",
  );

  const [comment, setComment] = useState(() =>
    mode === "edit" && initialValues ? initialValues.comment : "",
  );

  const isEditMode = mode === "edit";

  const numericPrice = Number(price);
  const commentLength = comment.replace(/\s/g, "").length;

  const isPriceValid =
    Number.isInteger(numericPrice) && numericPrice >= 1000 && numericPrice < 100_000_000;

  const isCommentValid = commentLength >= 10 && commentLength <= 1_000;
  const isFormValid = isPriceValid && isCommentValid;

  const address = [request.sido, request.sigungu, request.bname].filter(Boolean).join(" ");

  const displayPrice = price ? Number(price).toLocaleString("ko-KR") : "";

  const handlePriceChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");

    setPrice(numbersOnly);
  };

  const handleCommentChange = (value: string) => {
    if (value.replace(/\s/g, "").length <= 1_000) {
      setComment(value);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid || isSubmitting) return;

    onSubmit({
      price: numericPrice,
      comment: comment.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "견적 수정하기" : "견적 보내기"}
      className={styles.modal}
      footer={
        <Button
          className={styles.submitButton}
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting
            ? isEditMode
              ? "수정 중..."
              : "전송 중..."
            : isEditMode
              ? "견적 수정하기"
              : "견적 보내기"}
        </Button>
      }
    >
      <section className={styles.requestSummary}>
        <div className={styles.tags}>
          <Tag variant="request" serviceType={request.serviceType} size="md" />

          {isDesignated && <Tag variant="designated" size="md" />}
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
      </section>

      <div className={styles.form}>
        <Input
          className={styles.priceField}
          label="견적가를 입력해 주세요"
          value={displayPrice}
          placeholder="견적가 입력"
          maxLength={10}
          error={
            price !== "" && !isPriceValid
              ? "1,000원 이상 1억 원 미만으로 입력해 주세요."
              : undefined
          }
          disabled={isSubmitting}
          onChange={handlePriceChange}
        />

        <TextArea
          className={styles.commentField}
          label="코멘트를 입력해 주세요"
          value={comment}
          placeholder="최소 10자 이상 입력해 주세요"
          error={
            comment !== "" && !isCommentValid
              ? "코멘트는 10자 이상 1,000자 이하로 입력해 주세요."
              : undefined
          }
          disabled={isSubmitting}
          onChange={handleCommentChange}
        />
      </div>
    </Modal>
  );
}
