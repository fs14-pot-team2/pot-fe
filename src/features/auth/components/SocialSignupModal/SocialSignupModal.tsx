"use client";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import axios from "axios";
import { type SubmitEvent, useId, useRef, useState } from "react";
import { validateSocialPassword } from "../../utils/validateSocialPassword";
import styles from "./SocialSignupModal.module.css";

type SocialSignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
};

export default function SocialSignupModal({ isOpen, onClose, onSubmit }: SocialSignupModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const formId = useId();

  const handleClose = () => {
    if (submittingRef.current) return;
    onClose();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const validationError = validateSocialPassword(password, confirmPassword);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit(password);
    } catch (error) {
      const code = axios.isAxiosError<{ code?: string }>(error)
        ? error.response?.data?.code
        : undefined;

      if (code === "SOCIAL_SIGNUP_TOKEN_INVALID") {
        setErrorMessage("가입 인증이 만료됐어요. 로그인 화면으로 돌아가 다시 시작해 주세요.");
      } else if (
        code === "SOCIAL_EMAIL_ALREADY_EXISTS" ||
        code === "SOCIAL_ACCOUNT_ALREADY_LINKED"
      ) {
        setErrorMessage("이미 등록된 계정이에요. 로그인 화면으로 돌아가 확인해 주세요.");
      } else {
        setErrorMessage("회원가입을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }

      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="비밀번호 설정"
      footer={
        <Button type="submit" form={formId} disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? "가입 처리 중..." : "가입 완료"}
        </Button>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <Input
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setErrorMessage(null);
            }}
            disabled={isSubmitting}
          />

          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해 주세요"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              setErrorMessage(null);
            }}
            disabled={isSubmitting}
          />
        </div>

        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}
