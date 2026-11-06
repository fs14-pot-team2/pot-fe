"use client";

import { useRouter } from "next/navigation";

import PartnerProfileForm from "@/features/profiles/sitter/components/PartnerProfileForm/PartnerProfileForm";
import { useCreatePartnerProfile } from "@/features/profiles/sitter/hooks/usePartnerProfile";
import { useToast } from "@/components/ui/Toast/ToastProvider";

import type {
  CreatePartnerProfileRequest,
  PartnerProfileValues,
} from "@/features/profiles/sitter/types";

export default function SitterProfileRegisterPage() {
  const router = useRouter();
  const createProfileMutation = useCreatePartnerProfile();
  const { showToast } = useToast();

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

  return (
    <PartnerProfileForm
      mode="create"
      isSubmitting={createProfileMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
