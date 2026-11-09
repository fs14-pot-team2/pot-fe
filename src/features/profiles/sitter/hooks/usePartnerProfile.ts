"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPartnerProfile,
  createProfileImagePresignedUrl,
  getPartnerProfile,
  updatePartnerProfile,
  uploadProfileImage,
} from "../api/sitterProfileApi";

import { sitterMyPageQueryKey } from "./useSitterMyPage";

import type { CreatePartnerProfileRequest, UpdatePartnerProfileRequest } from "../types";

interface CreatePartnerProfileVariables {
  input: CreatePartnerProfileRequest;
  imageFile: File | null;
}

interface UpdatePartnerProfileVariables {
  input: UpdatePartnerProfileRequest;
  imageFile: File | null;
}

export const partnerProfileQueryKey = ["partner-profile"] as const;

export function useCreatePartnerProfile() {
  return useMutation({
    mutationFn: async ({ input, imageFile }: CreatePartnerProfileVariables) => {
      let profileImageUrl = input.profileImageUrl;

      if (imageFile) {
        const contentType = imageFile.type;

        if (
          contentType !== "image/jpeg" &&
          contentType !== "image/png" &&
          contentType !== "image/webp"
        ) {
          throw new Error("지원하지 않는 이미지 형식입니다.");
        }

        const { uploadUrl, imageUrl } = await createProfileImagePresignedUrl({
          contentType,
          fileSize: imageFile.size,
        });

        await uploadProfileImage(uploadUrl, imageFile);

        profileImageUrl = imageUrl;
      }

      return createPartnerProfile({
        ...input,
        profileImageUrl,
      });
    },
  });
}

export function usePartnerProfile() {
  return useQuery({
    queryKey: partnerProfileQueryKey,
    queryFn: getPartnerProfile,
  });
}

export function useUpdatePartnerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ input, imageFile }: UpdatePartnerProfileVariables) => {
      let profileImageUrl = input.profileImageUrl;

      if (imageFile) {
        const contentType = imageFile.type;

        if (
          contentType !== "image/jpeg" &&
          contentType !== "image/png" &&
          contentType !== "image/webp"
        ) {
          throw new Error("지원하지 않는 이미지 형식입니다.");
        }

        const { uploadUrl, imageUrl } = await createProfileImagePresignedUrl({
          contentType,
          fileSize: imageFile.size,
        });

        await uploadProfileImage(uploadUrl, imageFile);

        profileImageUrl = imageUrl;
      }

      return updatePartnerProfile({
        ...input,
        profileImageUrl,
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: partnerProfileQueryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: sitterMyPageQueryKey,
        }),
      ]);
    },
  });
}
