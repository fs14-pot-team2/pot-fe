"use client";

import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import ProfileImage from "@/components/ui/ProfileImage/ProfileImage";
import Tag from "@/components/ui/Tag/Tag";
import { formatDateOnly } from "@/utils/dateFormat";
import { isAxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import type { ReviewFormValues, ReviewQuoteType, ReviewServiceType } from "../../types/review";
import styles from "./ReviewFormModal.module.css";
import ReviewRatingInput from "./ReviewRatingInput";
import TextArea from "@/components/ui/TextArea/TextArea";

type ReviewFormTarget = {
  careRequest: {
    serviceType: ReviewServiceType;
    endDate: string;
  };
  confirmedQuote: {
    type: ReviewQuoteType;
    price: number;
  };
  sitter: {
    nickname: string;
    profileImageUrl: string | null;
  };
};

type ReviewFormModalProps = {
  isOpen: boolean;
  mode?: "create" | "edit";
  target: ReviewFormTarget;
  initialValues?: ReviewFormValues;
  onClose: () => void;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
};

function getSubmitErrorMessage(error: unknown): string {
  const code = isAxiosError<{ code?: string }>(error) ? error.response?.data?.code : undefined;

  switch (code) {
    case "REVIEW_ALREADY_EXISTS":
      return "이미 리뷰를 작성한 돌봄 요청입니다.";

    case "REVIEW_NOT_WRITABLE":
      return "아직 리뷰를 작성할 수 없는 돌봄 요청입니다.";

    case "CARE_REQUEST_NOT_FOUND":
      return "돌봄 요청을 찾을 수 없습니다.";

    case "REVIEW_NOT_FOUND":
      return "수정할 리뷰를 찾을 수 없습니다.";

    case "INVALID_REVIEW_RATING":
    case "INVALID_REVIEW_CONTENT":
      return "별점과 리뷰 내용을 다시 확인해 주세요.";

    case "UNAUTHORIZED":
    case "TOKEN_EXPIRED":
      return "로그인 상태를 확인해 주세요.";

    case "FORBIDDEN":
    case "REVIEW_ACCESS_FORBIDDEN":
      return "리뷰를 등록하거나 수정할 권한이 없습니다.";

    default:
      return "리뷰를 저장하지 못했습니다. 다시 시도해 주세요.";
  }
}

const CLOSE_ANIMATION_MS = 250;

export default function ReviewFormModal({
  isOpen,
  mode = "create",
  target,
  initialValues,
  onClose,
  onSubmit,
}: ReviewFormModalProps) {
  const isEditMode = mode === "edit";

  const [rating, setRating] = useState(isEditMode ? (initialValues?.rating ?? 0) : 0);
  const [content, setContent] = useState(isEditMode ? (initialValues?.content ?? "") : "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const submittingRef = useRef(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentLength = content.replace(/\s/g, "").length;
  const isRatingValid = Number.isInteger(rating) && rating >= 1 && rating <= 5;
  const isContentValid = contentLength >= 1 && contentLength <= 150;
  const isFormValid = isRatingValid && isContentValid;

  let contentError: string | undefined;

  if (contentLength > 150) {
    contentError = "공백을 제외하고 150자 이하로 작성해 주세요.";
  } else if (content.length > 0 && contentLength === 0) {
    contentError = "내용을 입력해 주세요.";
  }

  const formattedEndDate = formatDateOnly(target.careRequest.endDate, "dots");
  const formattedPrice = `${target.confirmedQuote.price.toLocaleString("ko-KR")}원`;
  const isDesignated = target.confirmedQuote.type === "DESIGNATED";

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleClose = (afterSubmit = false) => {
    if ((submittingRef.current && !afterSubmit) || closingRef.current) {
      return;
    }

    const shouldAnimate =
      window.matchMedia("(max-width: 540px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!shouldAnimate) {
      onClose();
      return;
    }

    closingRef.current = true;
    setIsClosing(true);

    closeTimerRef.current = setTimeout(onClose, CLOSE_ANIMATION_MS);
  };

  const handleSubmit = async () => {
    if (!isFormValid || submittingRef.current || closingRef.current) {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await onSubmit({ rating, content });
      handleClose(true);
    } catch (error) {
      setErrorMessage(getSubmitErrorMessage(error));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleClose()}
      title={isEditMode ? "리뷰 수정하기" : "리뷰 쓰기"}
      className={`${styles.modal} ${isClosing ? styles.closing : ""}`}
      footer={
        <Button
          className={styles.submitButton}
          disabled={!isFormValid || isSubmitting || isClosing}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting
            ? isEditMode
              ? "수정 중..."
              : "등록 중..."
            : isEditMode
              ? "리뷰 수정하기"
              : "리뷰 등록"}
        </Button>
      }
    >
      <section className={styles.summary} aria-label="돌봄 정보">
        <div className={styles.tags}>
          <Tag variant="request" serviceType={target.careRequest.serviceType} />
          {isDesignated && <Tag variant="designated" />}
        </div>

        <div className={styles.sitterInfo}>
          <ProfileImage
            src={target.sitter.profileImageUrl}
            alt={`${target.sitter.nickname} 프로필 이미지`}
            sizes="(max-width: 768px) 48px, 72px"
            className={styles.avatar}
          />

          <div className={styles.sitterDetails}>
            <p className={styles.nickname}>{target.sitter.nickname} 팟트너</p>
            <div className={styles.meta}>
              <span>
                <span className={styles.metaLabel}>종료일</span>
                {formattedEndDate}
              </span>

              <span className={styles.divider} aria-hidden="true" />

              <span>
                <span className={styles.metaLabel}>견적가</span>
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.form}>
        <ReviewRatingInput
          value={rating}
          onChange={setRating}
          disabled={isSubmitting || isClosing}
        />

        <div className={styles.reviewField}>
          <TextArea
            label="상세 후기를 작성해 주세요"
            required
            value={content}
            onChange={setContent}
            placeholder="돌봄 서비스에 대한 후기를 작성해 주세요."
            disabled={isSubmitting || isClosing}
            className={styles.textArea}
            error={contentError}
          />
          <p className={styles.counter}>{contentLength}/150</p>
        </div>
      </div>

      {errorMessage && (
        <p className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
