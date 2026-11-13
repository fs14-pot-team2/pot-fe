"use client";

import PageMain from "@/components/layout/Page/PageMain";
import PageContainer from "@/components/layout/Page/PageContainer";

import { useMemo } from "react"; //initialValues 객체가 렌더링마다 새로 만들어지면 폼의 reset()이 반복되어 사용자가 작성 중인 값이 기존 값으로 돌아갈 수 있어서 사용
import { useRouter } from "next/navigation";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import PartnerProfileForm from "@/features/profiles/sitter/components/PartnerProfileForm/PartnerProfileForm";
import {
  usePartnerProfile,
  useUpdatePartnerProfile,
} from "@/features/profiles/sitter/hooks/usePartnerProfile";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import type {
  PartnerProfileValues,
  UpdatePartnerProfileRequest,
} from "@/features/profiles/sitter/types";

function SitterProfileEditPageContent() {
  const router = useRouter();
  const { showToast } = useToast();

  const { data: profile, isPending, isError, refetch } = usePartnerProfile();

  const updateProfileMutation = useUpdatePartnerProfile();

  const initialValues = useMemo<PartnerProfileValues | undefined>(() => {
    if (!profile) {
      return undefined;
    }

    return {
      profileImageUrl: profile.profileImageUrl,
      gender: profile.gender,
      shortIntroduction: profile.shortIntroduction,
      description: profile.description ?? "",
      serviceTypes: profile.serviceTypes,
      serviceRegions: profile.serviceRegions,
    };
  }, [profile]);

  const handleSubmit = async (values: PartnerProfileValues, imageFile: File | null) => {
    if (!values.gender) {
      return;
    }

    const input: UpdatePartnerProfileRequest = {
      profileImageUrl: values.profileImageUrl,
      gender: values.gender,
      shortIntroduction: values.shortIntroduction,
      description: values.description.replace(/\s/g, "").length === 0 ? null : values.description,
      serviceTypes: values.serviceTypes,
      serviceRegions: values.serviceRegions,
    };

    try {
      await updateProfileMutation.mutateAsync({
        input,
        imageFile,
      });

      showToast({
        message: "프로필 수정이 완료되었습니다.",
      });

      router.replace("/sitter/my");
    } catch {
      showToast({
        message: "프로필을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  };

  const handleCancel = () => {
    router.replace("/sitter/my");
  };

  if (isPending) {
    return <p>프로필 정보를 불러오고 있어요.</p>;
  }

  if (isError || !initialValues) {
    return (
      <EmptyState
        messages={["프로필 정보를 불러오지 못했어요."]}
        action={{
          label: "다시 시도",
          onClick: () => void refetch(),
        }}
      />
    );
  }

  return (
    <PartnerProfileForm
      mode="edit"
      initialValues={initialValues}
      isSubmitting={updateProfileMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}

export default function SitterProfileEditPage() {
  return (
    <PageMain>
      <PageContainer>
        <SitterProfileEditPageContent />
      </PageContainer>
    </PageMain>
  );
}
