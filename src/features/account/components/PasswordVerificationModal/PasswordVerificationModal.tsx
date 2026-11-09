"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal/Modal";
import Input from "@/components/ui/Input/Input";
import { useVerifyPasswordMutation } from "../../hooks/useAccountMutations";
import styles from "./PasswordVerificationModal.module.css";

interface PasswordVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function PasswordVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: PasswordVerificationModalProps) {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const {
    mutate: verifyPassword,
    reset: resetVerification,
    isPending,
  } = useVerifyPasswordMutation();

  const resetModal = () => {
    setPassword("");
    setPasswordError("");
    resetVerification();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length === 0) {
      setPasswordError("비밀번호를 입력해 주세요.");
      return;
    }

    verifyPassword(
      { password },
      {
        onSuccess: () => {
          resetModal();
          onClose();
          onVerified();
        },
        onError: (error) => {
          const code = axios.isAxiosError<{ code?: string }>(error)
            ? error.response?.data?.code
            : undefined;

          if (code === "PASSWORD_MISMATCH") {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            return;
          }

          setPasswordError("비밀번호 인증에 실패했습니다. 다시 시도해 주세요.");
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className={styles.modal}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.description}>본인확인을 위해 비밀번호를 입력해 주세요</p>

        <Input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호를 입력해 주세요"
          error={passwordError}
          disabled={isPending}
        />
      </form>
    </Modal>
  );
}
