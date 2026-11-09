"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useController, useForm } from "react-hook-form";
import axios from "axios";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import type { UpdateAccountInput } from "@/features/account/api/accountApi";
import { useUpdateAccountMutation } from "@/features/account/hooks/useAccountMutations";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  NICKNAME_FORMAT_MESSAGE,
  NICKNAME_REGEX,
  PASSWORD_CONFIRM_MESSAGE,
  PASSWORD_FORMAT_MESSAGE,
  PASSWORD_REGEX,
} from "@/constants/validation";

import styles from "./AccountEditPage.module.css";

interface AccountEditFormValues {
  nickname: string;
  password: string;
  confirmPassword: string;
}

function removeWhitespace(value: string) {
  return value.replace(/\s/g, "");
}

export default function SitterAccountEditPage() {
  const router = useRouter();
  const { user, status, isAccountVerified, clearAccountVerification } = useAuth();
  const { showToast } = useToast();
  const updateAccountMutation = useUpdateAccountMutation();
  const [hasEditAccess] = useState(isAccountVerified);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isValid },
  } = useForm<AccountEditFormValues>({
    mode: "onChange",
    defaultValues: {
      nickname: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      nickname: user.nickname,
      password: "",
      confirmPassword: "",
    });
  }, [reset, user]);

  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated" || !hasEditAccess) {
      router.replace("/sitter/my");
      return;
    }

    clearAccountVerification();
  }, [clearAccountVerification, hasEditAccess, router, status]);

  const {
    field: nicknameField,
    fieldState: { error: nicknameError },
  } = useController({
    name: "nickname",
    control,
    rules: {
      validate: (value) => NICKNAME_REGEX.test(removeWhitespace(value)) || NICKNAME_FORMAT_MESSAGE,
    },
  });

  const {
    field: passwordField,
    fieldState: { error: passwordError },
  } = useController({
    name: "password",
    control,
    rules: {
      deps: ["confirmPassword"],
      validate: (value) => {
        const normalizedPassword = removeWhitespace(value);

        return (
          normalizedPassword.length === 0 ||
          PASSWORD_REGEX.test(normalizedPassword) ||
          PASSWORD_FORMAT_MESSAGE
        );
      },
    },
  });

  const {
    field: confirmPasswordField,
    fieldState: { error: confirmPasswordError },
  } = useController({
    name: "confirmPassword",
    control,
    rules: {
      validate: (value, values) => {
        const normalizedPassword = removeWhitespace(values.password);
        const normalizedConfirmPassword = removeWhitespace(value);

        if (normalizedPassword.length === 0 && normalizedConfirmPassword.length === 0) {
          return true;
        }

        if (!PASSWORD_REGEX.test(normalizedConfirmPassword)) {
          return PASSWORD_FORMAT_MESSAGE;
        }

        return normalizedConfirmPassword === normalizedPassword || PASSWORD_CONFIRM_MESSAGE;
      },
    },
  });

  const handleNicknameChange = (value: string) => {
    clearErrors("nickname");
    nicknameField.onChange(value);
  };

  const handleCancel = () => {
    clearAccountVerification();
    router.replace("/sitter/my");
  };

  const onSubmit = (values: AccountEditFormValues) => {
    if (!user) return;

    const input: UpdateAccountInput = {};

    const nickname = removeWhitespace(values.nickname);
    const password = removeWhitespace(values.password);

    if (nickname !== user.nickname) {
      input.nickname = nickname;
    }

    if (password.length > 0) {
      input.password = password;
    }

    if (Object.keys(input).length === 0) {
      clearAccountVerification();
      router.replace("/sitter/my");
      return;
    }

    updateAccountMutation.mutate(input, {
      onSuccess: () => {
        clearAccountVerification();
        showToast({
          message: "기본정보가 변경되었습니다.",
        });

        router.replace("/sitter/my");
      },
      onError: (error) => {
        const code = axios.isAxiosError<{ code?: string }>(error)
          ? error.response?.data?.code
          : undefined;

        if (code === "NICKNAME_ALREADY_EXISTS") {
          setError("nickname", {
            type: "server",
            message: "이미 존재하는 닉네임입니다.",
          });
          return;
        }

        if (code === "INVALID_NICKNAME_FORMAT") {
          setError("nickname", {
            type: "server",
            message: NICKNAME_FORMAT_MESSAGE,
          });
          return;
        }

        if (code === "INVALID_PASSWORD_FORMAT") {
          setError("password", {
            type: "server",
            message: PASSWORD_FORMAT_MESSAGE,
          });
          return;
        }

        showToast({
          message: "기본정보를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        });
      },
    });
  };

  if (status === "checking" || !user || !hasEditAccess) return null;

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h1 className={styles.title}>기본정보 관리</h1>

        <section className={styles.field}>
          <h2 className={styles.label}>이메일</h2>
          <p className={styles.email}>{user.email}</p>
        </section>

        <Input
          label="닉네임"
          value={nicknameField.value}
          onChange={handleNicknameChange}
          error={nicknameError?.message}
        />

        <Input
          label="새 비밀번호"
          type="password"
          value={passwordField.value}
          onChange={passwordField.onChange}
          placeholder="새 비밀번호를 입력해 주세요"
          error={passwordError?.message}
        />

        <Input
          label="새 비밀번호 확인"
          type="password"
          value={confirmPasswordField.value}
          onChange={confirmPasswordField.onChange}
          placeholder="새 비밀번호를 다시 한번 입력해 주세요"
          error={confirmPasswordError?.message}
        />

        <div className={styles.actions}>
          <Button
            type="submit"
            className={styles.button}
            disabled={!isValid || updateAccountMutation.isPending}
          >
            저장하기
          </Button>

          <Button
            type="button"
            variant="outlined"
            className={styles.button}
            onClick={handleCancel}
            disabled={updateAccountMutation.isPending}
          >
            취소
          </Button>
        </div>
      </form>
    </main>
  );
}
