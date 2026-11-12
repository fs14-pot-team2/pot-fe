"use client";

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
    return <AuthStatusFallback status={status} />;
  }

  if (status === "authenticated" && user?.role === "SITTER") {
    return <AccessDenied actionLabel="받은 요청으로 이동" actionHref="/sitter/requests" />;
  }

  return <>{children}</>;
}
