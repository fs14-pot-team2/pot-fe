import axios from "axios";

import { apiClient } from "@/lib/api/apiClient";

import type {
  CreatePartnerProfileRequest,
  PartnerProfileResponse,
  ProfileImagePresignedUrlRequest,
  ProfileImagePresignedUrlResponse,
} from "../types";

export async function createProfileImagePresignedUrl(
  input: ProfileImagePresignedUrlRequest,
): Promise<ProfileImagePresignedUrlResponse> {
  const { data } = await apiClient.post<ProfileImagePresignedUrlResponse>(
    "/profile-images/presigned-url",
    input,
  );

  return data;
}

export async function uploadProfileImage(uploadUrl: string, imageFile: File): Promise<void> {
  await axios.put(uploadUrl, imageFile, {
    headers: {
      "Content-Type": imageFile.type,
    },
  });
}

export async function createPartnerProfile(
  input: CreatePartnerProfileRequest,
): Promise<PartnerProfileResponse> {
  const { data } = await apiClient.post<PartnerProfileResponse>("/sitters/me/profile", input);

  return data;
}
