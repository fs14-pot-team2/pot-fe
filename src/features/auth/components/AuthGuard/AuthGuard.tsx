"use client";

import type { UserRole } from "@/features/auth/types/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type AuthGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "checking" || status === "error" || status === "guest" || user === null) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <p role="alert">이 페이지에 접근할 권한이 없습니다.</p>;
  }

  return <>{children}</>;
}
