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

type SignupError = {
  kind: "password" | "restart" | "retryable";
  message: string;
};

export default function SocialSignupModal({ isOpen, onClose, onSubmit }: SocialSignupModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState<SignupError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const formId = useId();

  const { passwordError, confirmPasswordError, isValid } = validateSocialPassword(
    password,
    confirmPassword,
  );

  const canSubmit =
    isValid && !isSubmitting && signupError?.kind !== "password" && signupError?.kind !== "restart";

  const handleClose = () => {
    if (submittingRef.current) return;
    onClose();
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || !canSubmit) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSignupError(null);

    try {
      await onSubmit(password);
    } catch (error) {
      const code = axios.isAxiosError<{ code?: string }>(error)
        ? error.response?.data?.code
        : undefined;

      if (code === "INVALID_PASSWORD_FORMAT") {
        setSignupError({
          kind: "password",
          message: "비밀번호는 영문, 숫자, !@#$만 사용하여 8~20자로 입력해 주세요.",
        });
      } else if (code === "SOCIAL_SIGNUP_TOKEN_INVALID") {
        setSignupError({
          kind: "restart",
          message: "가입 인증이 만료됐어요. 로그인 화면으로 돌아가 다시 시작해 주세요.",
        });
      } else if (
        code === "SOCIAL_EMAIL_ALREADY_EXISTS" ||
        code === "SOCIAL_ACCOUNT_ALREADY_LINKED"
      ) {
        setSignupError({
          kind: "restart",
          message: "이미 등록된 계정이에요. 로그인 화면으로 돌아가 확인해 주세요.",
        });
      } else {
        setSignupError({
          kind: "retryable",
          message: "회원가입을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.",
        });
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
        <Button type="submit" form={formId} disabled={!canSubmit} className={styles.submitButton}>
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

              if (signupError?.kind !== "restart") {
                setSignupError(null);
              }
            }}
            error={
              passwordError ?? (signupError?.kind === "password" ? signupError.message : undefined)
            }
            disabled={isSubmitting}
          />

          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해 주세요"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);

              if (signupError?.kind === "retryable") {
                setSignupError(null);
              }
            }}
            error={confirmPasswordError}
            disabled={isSubmitting}
          />
        </div>

        {signupError && signupError.kind !== "password" && (
          <p className={styles.errorMessage} role="alert">
            {signupError.message}
          </p>
        )}
      </form>
    </Modal>
  );
}
