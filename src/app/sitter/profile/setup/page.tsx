"use client";

import PageMain from "@/components/layout/Page/PageMain";
import PageContainer from "@/components/layout/Page/PageContainer";

import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/Toast/ToastProvider";
import PartnerProfileForm from "@/features/profiles/sitter/components/PartnerProfileForm/PartnerProfileForm";
import {
  useCreatePartnerProfile,
  usePartnerProfile,
} from "@/features/profiles/sitter/hooks/usePartnerProfile";

import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import type {
  CreatePartnerProfileRequest,
  PartnerProfileValues,
} from "@/features/profiles/sitter/types";
import { isAxiosError } from "axios";
import { useEffect } from "react";

function SitterProfileRegisterPageContent() {
  const router = useRouter();
  const createProfileMutation = useCreatePartnerProfile();
  const { data: profile, isPending, isError, error, refetch } = usePartnerProfile();

  const isRegistering = createProfileMutation.isPending || createProfileMutation.isSuccess;
  const { showToast } = useToast();

  const isProfileMissing =
    isError &&
    isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 404 &&
    error.response?.data?.code === "PROFILE_NOT_FOUND";

  useEffect(() => {
    if (profile && !isRegistering) {
      router.replace("/sitter/profile/edit");
    }
  }, [profile, isRegistering, router]);

  const handleSubmit = async (values: PartnerProfileValues, imageFile: File | null) => {
    if (!values.gender) {
      return;
    }

    const input: CreatePartnerProfileRequest = {
      profileImageUrl: values.profileImageUrl,
      gender: values.gender,
      shortIntroduction: values.shortIntroduction,
      description: values.description.replace(/\s/g, "").length === 0 ? null : values.description,
      serviceTypes: values.serviceTypes,
      serviceRegions: values.serviceRegions,
    };

    try {
      await createProfileMutation.mutateAsync({
        input,
        imageFile,
      });

      showToast({
        message: "프로필 등록이 완료되었습니다.",
      });

      router.replace("/sitter/requests");
    } catch {
      showToast({
        message: "프로필을 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  };

  if (isPending) {
    return <Loading variant="content" />;
  }

  if (profile && !isRegistering) {
    return <Loading variant="content" />;
  }

  if (isError && !isProfileMissing) {
    return (
      <div role="alert">
        <p>프로필 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.</p>

        <Button size="sm" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!isProfileMissing) {
    return <Loading variant="content" />;
  }

  return (
    <PartnerProfileForm
      mode="create"
      isSubmitting={createProfileMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}

export default function SitterProfileRegisterPage() {
  return (
    <PageMain>
      <PageContainer>
        <SitterProfileRegisterPageContent />
      </PageContainer>
    </PageMain>
  );
}
