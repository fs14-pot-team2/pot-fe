"use client";

import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import { isAxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { usePartnerProfile } from "../../hooks/usePartnerProfile";

type SitterProfileGuardProps = {
  children: ReactNode;
};

export default function SitterProfileGuard({ children }: SitterProfileGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSetupPage = pathname === "/sitter/profile/setup";

  const { data: profile, isPending, isError, error, refetch } = usePartnerProfile(!isSetupPage);

  const isProfileMissing =
    isError &&
    isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 404 &&
    error.response?.data?.code === "PROFILE_NOT_FOUND";

  useEffect(() => {
    if (isProfileMissing && !isSetupPage) {
      router.replace("/sitter/profile/setup");
    }
  }, [isProfileMissing, isSetupPage, router]);

  if (isSetupPage) {
    return <>{children}</>;
  }

  if (isProfileMissing) {
    return <Loading variant="content" />;
  }

  if (isPending) {
    return <Loading variant="content" />;
  }

  if (isError) {
    return (
      <div role="alert">
        <p>프로필 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.</p>

        <Button size="sm" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <>{children}</>;
}
