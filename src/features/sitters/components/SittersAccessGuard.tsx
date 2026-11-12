"use client";

import PageMain from "@/components/layout/Page/PageMain";
import PageContainer from "@/components/layout/Page/PageContainer";

import AccessDenied from "@/components/common/AccessDenied/AccessDenied";
import AuthStatusFallback from "@/features/auth/components/AuthStatusFallback/AuthStatusFallback";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { ReactNode } from "react";

type SittersAccessGuardProps = {
  children: ReactNode;
};

export default function SittersAccessGuard({ children }: SittersAccessGuardProps) {
  const { status, user } = useAuth();

  if (status === "checking" || status === "error") {
    return (
      <PageMain>
        <PageContainer>
          <AuthStatusFallback status={status} />
        </PageContainer>
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
