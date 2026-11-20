"use client";

import Button from "@/components/ui/Button/Button";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import { useAuth } from "@/lib/auth/AuthProvider";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { linkKakaoAccount, loginWithKakao, signupWithKakao } from "../../api/authApi";
import type { KakaoAuthResponse } from "../../types/socialAuth";
import { consumeKakaoCallback, hasPendingKakaoLink } from "../../utils/startKakaoAuth";
import SocialSignupModal from "../SocialSignupModal/SocialSignupModal";
import styles from "./KakaoCallback.module.css";

async function requestKakaoLogin() {
  const callback = consumeKakaoCallback();

  if (!callback || callback.pending.purpose === "link") {
    throw new Error("유효하지 않은 카카오 로그인 요청입니다.");
  }

  return loginWithKakao({
    role: callback.pending.role,
    code: callback.code,
    redirectUri: callback.pending.redirectUri,
  });
}

export default function KakaoCallback() {
  const router = useRouter();
  const { setSession, status, user } = useAuth();
  const requestedRef = useRef(false);

  const [result, setResult] = useState<KakaoAuthResponse | null>(null);
  const [error, setError] = useState<"email-exists" | "general" | null>(null);

  const [linkResult, setLinkResult] = useState<"success" | "already-linked" | "error" | null>(null);

  useEffect(() => {
    if (requestedRef.current) return;

    const isLink = hasPendingKakaoLink();

    if (isLink && status === "checking") return;

    requestedRef.current = true;

    if (isLink) {
      const requestKakaoLink = async () => {
        const callback = consumeKakaoCallback();

        if (
          !callback ||
          callback.pending.purpose !== "link" ||
          status !== "authenticated" ||
          !user ||
          callback.pending.userId !== user.id ||
          callback.pending.role !== user.role
        ) {
          throw new Error("유효하지 않은 카카오 계정 연결 요청입니다.");
        }

        return linkKakaoAccount({
          code: callback.code,
          redirectUri: callback.pending.redirectUri,
        });
      };

      void requestKakaoLink()
        .then(() => {
          setLinkResult("success");
        })
        .catch((error: unknown) => {
          const code = axios.isAxiosError<{ code?: string }>(error)
            ? error.response?.data?.code
            : undefined;

          setLinkResult(code === "SOCIAL_ACCOUNT_ALREADY_LINKED" ? "already-linked" : "error");
        });

      return;
    }

    void requestKakaoLogin()
      .then((response) => {
        if (response.isNewUser) {
          setResult(response);
          return;
        }

        setSession({ accessToken: response.accessToken, user: response.user });
        router.replace("/login");
      })
      .catch((caughtError: unknown) => {
        const code = axios.isAxiosError<{ code?: string }>(caughtError)
          ? caughtError.response?.data?.code
          : undefined;

        setError(code === "SOCIAL_EMAIL_ALREADY_EXISTS" ? "email-exists" : "general");
      });
  }, [router, setSession, status, user]);

  const returnPath = user?.role === "SITTER" ? "/sitter/my" : "/sitters";

  if (linkResult === "success") {
    return (
      <section className={styles.result} role="status">
        <h1 className={styles.title}>카카오 계정이 연결됐어요!</h1>

        <p className={styles.description}>
          이제 기존 POT 계정에 카카오로도 로그인할 수 있어요.
          <br />
          기본정보 관리는 비밀번호 확인 후 다시 이용할 수 있어요.
        </p>

        <Button type="button" onClick={() => router.replace(returnPath)}>
          서비스로 돌아가기
        </Button>
      </section>
    );
  }

  if (linkResult === "already-linked" || linkResult === "error") {
    return (
      <ErrorState
        variant="content"
        title={
          linkResult === "already-linked"
            ? "이미 연결된 카카오 계정이 있어요"
            : "카카오 계정을 연결하지 못했어요"
        }
        description={
          linkResult === "already-linked"
            ? "현재 POT 계정 또는 다른 계정의 카카오 연동 상태를 확인해 주세요."
            : "기본정보 관리에서 카카오 계정 연결을 다시 시도해 주세요."
        }
        actionLabel="서비스로 돌아가기"
        onAction={() => router.replace(returnPath)}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        variant="content"
        title={
          error === "email-exists" ? "이미 가입된 이메일이에요" : "카카오 인증을 완료하지 못했어요"
        }
        description={
          error === "email-exists"
            ? "기존 POT 계정으로 로그인한 뒤 기본정보 관리에서 카카오 계정을 연결해 주세요."
            : "로그인 화면으로 돌아가 다시 시도해 주세요."
        }
        actionLabel="로그인으로 돌아가기"
        onAction={() => router.replace("/login")}
      />
    );
  }

  if (result?.isNewUser) {
    return (
      <SocialSignupModal
        isOpen
        onClose={() => router.replace("/login")}
        onSubmit={async (password) => {
          const session = await signupWithKakao(result.signupToken, password);

          setSession(session);
          router.replace("/login");
        }}
      />
    );
  }

  return <Loading variant="content" message="카카오 로그인 정보를 확인하고 있어요." />;
}
