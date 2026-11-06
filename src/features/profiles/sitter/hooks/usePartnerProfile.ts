"use client";

import { useMutation } from "@tanstack/react-query";

import {
  createPartnerProfile,
  createProfileImagePresignedUrl,
  uploadProfileImage,
} from "../api/sitterProfileApi";

import type { CreatePartnerProfileRequest } from "../types";

interface CreatePartnerProfileVariables {
  input: CreatePartnerProfileRequest;
  imageFile: File | null;
}

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
