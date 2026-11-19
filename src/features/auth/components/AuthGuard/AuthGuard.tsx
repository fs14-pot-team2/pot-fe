"use client";

import AccessDenied from "@/components/common/AccessDenied/AccessDenied";
import PageContainer from "@/components/layout/Page/PageContainer";
import PageMain from "@/components/layout/Page/PageMain";
import ErrorState from "@/components/ui/ErrorState/ErrorState";
import Loading from "@/components/ui/Loading/Loading";
import type { UserRole } from "@/features/auth/types/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type AuthGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { status, user, retrySession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    }
  }, [router, status]);

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

  if (status === "guest" || user === null) {
    return <PageMain />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <PageMain>
        <PageContainer>
          <AccessDenied />
        </PageContainer>
      </PageMain>
    );
  }

  return <>{children}</>;
}
