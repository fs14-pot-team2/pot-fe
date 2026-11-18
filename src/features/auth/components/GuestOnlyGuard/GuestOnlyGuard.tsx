"use client";

import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import { usePartnerProfile } from "@/features/profiles/sitter/hooks/usePartnerProfile";
import { useAuth } from "@/lib/auth/AuthProvider";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type GuestOnlyGuardProps = {
  children: ReactNode;
};

export default function GuestOnlyGuard({ children }: GuestOnlyGuardProps) {
  const router = useRouter();
  const { status, user, retrySession } = useAuth();

  const isSitter = status === "authenticated" && user?.role === "SITTER";

  const { isSuccess, isError, error, refetch } = usePartnerProfile(isSitter);

  const isProfileMissing =
    isSitter &&
    isError &&
    isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 404 &&
    error.response?.data?.code === "PROFILE_NOT_FOUND";

  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    if (user.role === "OWNER") {
      router.replace("/sitters");
      return;
    }

    if (isProfileMissing) {
      router.replace("/sitter/profile/setup");
      return;
    }

    if (isSuccess) {
      router.replace("/sitter/requests");
    }
  }, [status, user, isProfileMissing, isSuccess, router]);

  if (status === "guest") {
    return <>{children}</>;
  }

  if (status === "error") {
    return (
      <ErrorState
        variant="content"
        title="로그인 상태를 확인하지 못했어요"
        onAction={retrySession}
      />
    );
  }

  if (isSitter && isError && !isProfileMissing) {
    return (
      <ErrorState
        variant="content"
        title="프로필 정보를 확인하지 못했어요"
        onAction={() => void refetch()}
      />
    );
  }

  return <Loading variant="content" />;
}
