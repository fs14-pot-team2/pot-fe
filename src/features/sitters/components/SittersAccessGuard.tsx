"use client";

import AccessDenied from "@/components/common/AccessDenied/AccessDenied";
import PageContainer from "@/components/layout/Page/PageContainer";
import PageMain from "@/components/layout/Page/PageMain";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { ReactNode } from "react";

type SittersAccessGuardProps = {
  children: ReactNode;
};

export default function SittersAccessGuard({ children }: SittersAccessGuardProps) {
  const { status, user, retrySession } = useAuth();

  if (status === "checking") {
    return (
      <PageMain variant="fullWidth">
        <Loading variant="full" />
      </PageMain>
    );
  }

  if (status === "error") {
    return (
      <PageMain variant="fullWidth">
        <ErrorState
          variant="page"
          title="로그인 상태를 확인하지 못했어요"
          onAction={retrySession}
        />
      </PageMain>
    );
  }

  if (status === "authenticated" && user?.role === "SITTER") {
    return (
      <PageMain>
        <PageContainer>
          <AccessDenied actionLabel="받은 요청으로 이동" actionHref="/sitter/requests" />
        </PageContainer>
      </PageMain>
    );
  }

  return <>{children}</>;
}
