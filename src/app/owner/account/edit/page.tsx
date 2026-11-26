"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useController, useForm } from "react-hook-form";
import axios from "axios";

import PageContainer from "@/components/layout/Page/PageContainer";
import PageMain from "@/components/layout/Page/PageMain";
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

import styles from "@/app/sitter/account/edit/AccountEditPage.module.css";
import SocialAccountLinkSection from "@/features/account/components/SocialAccountLinkSection/SocialAccountLinkSection";

interface AccountEditFormValues {
  nickname: string;
  password: string;
  confirmPassword: string;
}

const FALLBACK_PATH = "/";

function hasControlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

// 이전 페이지 경로 검증
function getReturnPath(returnTo: string | null): string {
  if (
    !returnTo ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    returnTo.includes("\\") ||
    hasControlCharacters(returnTo)
  ) {
    return FALLBACK_PATH;
  }

  try {
    const baseOrigin = "https://pot.local";
    const target = new URL(returnTo, baseOrigin);

    if (target.origin !== baseOrigin) {
      return FALLBACK_PATH;
    }

    if (
      target.pathname === "/owner/account/edit" ||
      target.pathname.startsWith("/owner/account/edit/")
    ) {
      return FALLBACK_PATH;
    }

    return target.pathname + target.search + target.hash;
  } catch {
    return FALLBACK_PATH;
  }
}

function OwnerAccountEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, status, isAccountVerified, clearAccountVerification } = useAuth();

  const { showToast } = useToast();
  const updateAccountMutation = useUpdateAccountMutation();

  // 연속 클릭 및 중복 제출 방지
  const savingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSaving = isSubmitting || updateAccountMutation.isPending;

  // URL의 returnTo를 직접 읽어 이전 페이지 경로 계산
  const returnPath = getReturnPath(searchParams.get("returnTo"));

  // 비밀번호 인증을 거쳐 진입했는지 보관
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

  // 현재 계정 정보 초기화
  useEffect(() => {
    if (!user) return;

    reset({
      nickname: user.nickname,
      password: "",
      confirmPassword: "",
    });
  }, [reset, user]);

  // 인증 및 역할 검증
  useEffect(() => {
    if (status === "checking") return;

    if (status !== "authenticated" || user?.role !== "OWNER" || !hasEditAccess) {
      router.replace(returnPath);
      return;
    }

    clearAccountVerification();
  }, [clearAccountVerification, hasEditAccess, returnPath, router, status, user?.role]);

  const {
    field: nicknameField,
    fieldState: { error: nicknameError },
  } = useController({
    name: "nickname",
    control,
    rules: {
      validate: (value) => NICKNAME_REGEX.test(value) || NICKNAME_FORMAT_MESSAGE,
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
      validate: (value) =>
        value.length === 0 || PASSWORD_REGEX.test(value) || PASSWORD_FORMAT_MESSAGE,
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
        const password = values.password;

        if (password.length === 0 && value.length === 0) {
          return true;
        }

        if (!PASSWORD_REGEX.test(value)) {
          return PASSWORD_FORMAT_MESSAGE;
        }

        return value === password || PASSWORD_CONFIRM_MESSAGE;
      },
    },
  });

  const handleNicknameChange = (value: string) => {
    clearErrors("nickname");
    nicknameField.onChange(value);
  };

  // 취소 시 이전 페이지로 이동
  const handleCancel = () => {
    if (isSaving || savingRef.current) return;

    clearAccountVerification();
    router.replace(returnPath);
  };

  // 저장 성공 처리
  const handleSaveSuccess = () => {
    clearAccountVerification();

    showToast({
      message: "저장되었습니다.",
    });

    router.replace(returnPath);
  };

  // 기본정보 저장
  const onSubmit = async (values: AccountEditFormValues) => {
    // 사용자 역할 검증 및 중복 제출 방지
    if (!user || user.role !== "OWNER" || isSaving || savingRef.current) {
      return;
    }

    savingRef.current = true;
    setIsSubmitting(true);

    let shouldNavigate = false;

    const input: UpdateAccountInput = {};

    if (values.nickname !== user.nickname) {
      input.nickname = values.nickname;
    }

    if (values.password.length > 0) {
      input.password = values.password;
    }

    try {
      // 변경사항이 있는 경우에만 API 요청
      if (Object.keys(input).length > 0) {
        await updateAccountMutation.mutateAsync(input);
      }

      // 변경사항 유무와 관계없이 성공 토스트 표시
      // 저장 완료 후 이전 페이지로 이동
      handleSaveSuccess();
      shouldNavigate = true;
    } catch (error) {
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
    } finally {
      // 저장 실패 시 잠금 해제 및 재시도 허용
      // 저장 성공 시에는 페이지 이동 전까지 중복 제출 방지
      if (!shouldNavigate) {
        savingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  if (status === "checking" || !user || user.role !== "OWNER" || !hasEditAccess) {
    return <PageMain />;
  }

  return (
    <PageMain>
      <PageContainer>
        <form className={styles.form} onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
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

          <SocialAccountLinkSection user={user} />

          <div className={styles.actions}>
            <Button type="submit" className={styles.button} disabled={!isValid || isSaving}>
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              className={styles.button}
              onClick={handleCancel}
              disabled={isSaving}
            >
              취소
            </Button>
          </div>
        </form>
      </PageContainer>
    </PageMain>
  );
}

// useSearchParams 사용 페이지의 정적 빌드를 위한 Suspense
export default function OwnerAccountEditPage() {
  return (
    <Suspense fallback={<PageMain />}>
      <OwnerAccountEditContent />
    </Suspense>
  );
}
