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
import PasswordVerificationModal from "@/features/account/components/PasswordVerificationModal/PasswordVerificationModal";

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

  const { user, status, isAccountVerified, clearAccountVerification, getSessionVersion } =
    useAuth();

  const { showToast } = useToast();
  const updateAccountMutation = useUpdateAccountMutation();

  // 연속 클릭 및 중복 제출 방지
  const savingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pendingReauth, setPendingReauth] = useState<{
    input: UpdateAccountInput;
    sessionVersion: number;
  } | null>(null);

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
      validate: (value, values) => value === values.password || PASSWORD_CONFIRM_MESSAGE,
    },
  });

  const handleNicknameChange = (value: string) => {
    clearErrors("nickname");
    nicknameField.onChange(value);
  };

  // 취소 시 이전 페이지로 이동
  const handleCancel = () => {
    if (isSaving || savingRef.current || pendingReauth) return;

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

  // 기본정보 저장 및 재인증 이후 자동 저장
  const saveAccount = async (input: UpdateAccountInput, allowReauth = true) => {
    if (savingRef.current) return;

    savingRef.current = true;
    setIsSubmitting(true);

    const sessionVersion = getSessionVersion();
    let shouldNavigate = false;

    try {
      if (Object.keys(input).length > 0) {
        await updateAccountMutation.mutateAsync(input);
      }

      handleSaveSuccess();
      shouldNavigate = true;
    } catch (error) {
      if (getSessionVersion() !== sessionVersion) return;

      const code = axios.isAxiosError<{ code?: string }>(error)
        ? error.response?.data?.code
        : undefined;

      if (code === "REAUTHENTICATION_REQUIRED" && allowReauth) {
        setPendingReauth({ input, sessionVersion });
        return;
      }

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
      if (!shouldNavigate) {
        savingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  // 저장 버튼 클릭
  const onSubmit = async (values: AccountEditFormValues) => {
    if (!user || user.role !== "OWNER" || isSaving || savingRef.current || pendingReauth) {
      return;
    }

    const input: UpdateAccountInput = {};

    if (values.nickname !== user.nickname) {
      input.nickname = values.nickname;
    }

    if (values.password.length > 0) {
      input.password = values.password;
    }

    await saveAccount(input);
  };

  // 비밀번호 재확인 성공 후 자동 저장
  const handleReauthVerified = () => {
    if (!pendingReauth) return;

    const { input, sessionVersion } = pendingReauth;
    setPendingReauth(null);

    if (getSessionVersion() !== sessionVersion) return;

    void saveAccount(input, false);
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
            error={confirmPasswordField.value !== "" ? confirmPasswordError?.message : undefined}
          />

          <SocialAccountLinkSection user={user} />

          <div className={styles.actions}>
            <Button
              type="submit"
              className={styles.button}
              disabled={!isValid || isSaving || !!pendingReauth}
            >
              {isSaving ? "저장 중..." : "저장하기"}
            </Button>

            <Button
              type="button"
              variant="outlined"
              className={styles.button}
              onClick={handleCancel}
              disabled={isSaving || !!pendingReauth}
            >
              취소
            </Button>
          </div>
        </form>
      </PageContainer>

      {pendingReauth && (
        <PasswordVerificationModal
          isOpen
          description="본인 확인이 만료되었습니다. 비밀번호를 다시 확인해 주세요."
          onClose={() => setPendingReauth(null)}
          onVerified={handleReauthVerified}
        />
      )}
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
