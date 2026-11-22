"use client";

import Button from "@/components/ui/Button/Button";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import { useAuth } from "@/lib/auth/AuthProvider";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  linkGoogleAccount,
  linkKakaoAccount,
  loginWithGoogle,
  loginWithKakao,
  signupWithGoogle,
  signupWithKakao,
} from "../../api/authApi";
import type { AuthUser } from "../../types/auth";
import type { SocialAuthResponse } from "../../types/socialAuth";
import {
  consumeSocialCallback,
  hasPendingSocialLink,
  type SocialProvider,
} from "../../utils/socialOAuth";
import SocialSignupModal from "../SocialSignupModal/SocialSignupModal";
import styles from "./SocialCallback.module.css";

const SOCIAL_ACTIONS = {
  KAKAO: {
    name: "카카오",
    login: loginWithKakao,
    signup: signupWithKakao,
    link: linkKakaoAccount,
  },
  GOOGLE: {
    name: "구글",
    login: loginWithGoogle,
    signup: signupWithGoogle,
    link: linkGoogleAccount,
  },
} as const;

async function requestSocialLogin(provider: SocialProvider): Promise<SocialAuthResponse> {
  const callback = consumeSocialCallback(provider);

  if (!callback || callback.pending.purpose === "link") {
    throw new Error("유효하지 않은 소셜 로그인 요청입니다.");
  }

  return SOCIAL_ACTIONS[provider].login({
    role: callback.pending.role,
    code: callback.code,
    redirectUri: callback.pending.redirectUri,
  });
}

async function requestSocialLink(provider: SocialProvider, user: AuthUser | null) {
  const callback = consumeSocialCallback(provider);

  if (
    !callback ||
    callback.pending.purpose !== "link" ||
    !user ||
    callback.pending.userId !== user.id ||
    callback.pending.role !== user.role
  ) {
    throw new Error("유효하지 않은 소셜 계정 연결 요청입니다.");
  }

  return SOCIAL_ACTIONS[provider].link({
    code: callback.code,
    redirectUri: callback.pending.redirectUri,
  });
}

type SocialCallbackProps = {
  provider: SocialProvider;
};

export default function SocialCallback({ provider }: SocialCallbackProps) {
  const router = useRouter();
  const { setSession, status, user } = useAuth();
  const requestedRef = useRef(false);

  const [result, setResult] = useState<SocialAuthResponse | null>(null);
  const [error, setError] = useState<"email-exists" | "general" | null>(null);
  const [linkResult, setLinkResult] = useState<"success" | "already-linked" | "error" | null>(null);

  useEffect(() => {
    if (requestedRef.current) return;

    const isLink = hasPendingSocialLink(provider);

    if (isLink && status === "checking") return;

    requestedRef.current = true;

    if (isLink) {
      void requestSocialLink(provider, status === "authenticated" ? user : null)
        .then(() => {
          setLinkResult("success");
        })
        .catch((caughtError: unknown) => {
          const code = axios.isAxiosError<{ code?: string }>(caughtError)
            ? caughtError.response?.data?.code
            : undefined;

          setLinkResult(code === "SOCIAL_ACCOUNT_ALREADY_LINKED" ? "already-linked" : "error");
        });

      return;
    }

    void requestSocialLogin(provider)
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
  }, [provider, router, setSession, status, user]);

  const returnPath = user?.role === "SITTER" ? "/sitter/my" : "/sitters";

  if (linkResult === "success") {
    return (
      <section className={styles.result} role="status">
        <h1 className={styles.title}>{SOCIAL_ACTIONS[provider].name} 계정이 연결됐어요!</h1>

        <p className={styles.description}>
          이제 기존 POT 계정에 {SOCIAL_ACTIONS[provider].name}로도 로그인할 수 있어요.
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
            ? `이미 연결된 ${SOCIAL_ACTIONS[provider].name} 계정이 있어요`
            : `${SOCIAL_ACTIONS[provider].name} 계정을 연결하지 못했어요`
        }
        description={
          linkResult === "already-linked"
            ? `현재 POT 계정 또는 다른 계정의 ${SOCIAL_ACTIONS[provider].name} 연동 상태를 확인해 주세요.`
            : `기본정보 관리에서 ${SOCIAL_ACTIONS[provider].name} 계정 연결을 다시 시도해 주세요.`
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
          error === "email-exists"
            ? "이미 가입된 이메일이에요"
            : `${SOCIAL_ACTIONS[provider].name} 인증을 완료하지 못했어요`
        }
        description={
          error === "email-exists"
            ? `기존 POT 계정으로 로그인한 뒤 기본정보 관리에서 ${SOCIAL_ACTIONS[provider].name} 계정을 연결해 주세요.`
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
          const session = await SOCIAL_ACTIONS[provider].signup(result.signupToken, password);

          setSession(session);
          router.replace("/login");
        }}
      />
    );
  }

  return (
    <Loading
      variant="content"
      message={`${SOCIAL_ACTIONS[provider].name} 로그인 정보를 확인하고 있어요.`}
    />
  );
}
