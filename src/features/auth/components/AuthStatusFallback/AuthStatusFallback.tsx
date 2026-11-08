"use client";

import Button from "@/components/ui/Button/Button";
import { useAuth } from "@/lib/auth/AuthProvider";

type AuthStatusFallbackProps = {
  status: "checking" | "error";
};

export default function AuthStatusFallback({ status }: AuthStatusFallbackProps) {
  const { retrySession } = useAuth();

  if (status === "checking") {
    return <p role="status">로그인 상태를 확인하고 있습니다.</p>;
  }

  return (
    <div role="alert">
      <p>로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>

      <Button type="button" variant="solid" size="sm" onClick={retrySession}>
        다시 시도
      </Button>
    </div>
  );
}
