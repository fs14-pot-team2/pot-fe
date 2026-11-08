"use client";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";
import { useAuth } from "@/lib/auth/AuthProvider";
import Header from "./Header";
import AuthStatusFallback from "@/features/auth/components/AuthStatusFallback/AuthStatusFallback";

export default function AuthHeader() {
  const { user, status } = useAuth();
  const logoutMutation = useLogoutMutation();
  const { showToast } = useToast();

  const handleLogout = () => {
    if (logoutMutation.isPending) return;

    logoutMutation.mutate(undefined, {
      onError: () => {
        showToast({
          message: "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        });
      },
    });
  };

  if (status === "checking" || status === "error") {
    return <AuthStatusFallback status={status} />;
  }

  return (
    <Header
      isLoggedIn={status === "authenticated" && user !== null}
      userRole={user?.role}
      nickname={user?.nickname}
      onLogout={handleLogout}
    />
  );
}
