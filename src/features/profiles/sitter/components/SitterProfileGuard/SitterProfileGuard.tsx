"use client";

import PageContainer from "@/components/layout/Page/PageContainer";
import PageMain from "@/components/layout/Page/PageMain";

import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { isAxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { usePartnerProfile } from "../../hooks/usePartnerProfile";

type SitterProfileGuardProps = {
  children: ReactNode;
};

export default function SitterProfileGuard({ children }: SitterProfileGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const { sessionRevision } = useAuth();
  const notifiedSessionRef = useRef<number | null>(null);

  const isSetupPage = pathname === "/sitter/profile/setup";

  const {
    data: profile,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = usePartnerProfile(!isSetupPage);

  const isProfileMissing =
    isError &&
    isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 404 &&
    error.response?.data?.code === "PROFILE_NOT_FOUND";

  useEffect(() => {
    if (isSetupPage) {
      notifiedSessionRef.current = null;
      return;
    }

    if (isProfileMissing && notifiedSessionRef.current !== sessionRevision) {
      notifiedSessionRef.current = sessionRevision;

      showToast({
        message: "팟트너 서비스를 이용하려면 먼저 프로필을 등록해 주세요.",
      });

      router.replace("/sitter/profile/setup");
    }
  }, [isProfileMissing, isSetupPage, router, sessionRevision, showToast]);

  if (isSetupPage) {
    return <>{children}</>;
  }

  if (isProfileMissing) {
    return (
      <PageMain>
        <PageContainer>
          <Loading variant="content" />
        </PageContainer>
      </PageMain>
    );
  }

  if (isPending || (isError && isFetching)) {
    return (
      <PageMain>
        <PageContainer>
          <Loading variant="content" />
        </PageContainer>
      </PageMain>
    );
  }

  if (isError) {
    return (
      <PageMain variant="fullWidth">
        <ErrorState
          variant="page"
          title="프로필 정보를 확인하지 못했어요"
          onAction={() => void refetch()}
        />
      </PageMain>
    );
  }

  if (!profile) {
    return <PageMain />;
  }

  return <>{children}</>;
}
