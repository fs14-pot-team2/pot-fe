import axios from "axios";

import { apiClient } from "@/lib/api/apiClient";
import type {
  OwnerProfile,
  PresignedUrlInput,
  PresignedUrlResponse,
  UpdateOwnerProfileInput,
} from "../types/ownerProfile";

export async function getOwnerProfile(): Promise<OwnerProfile> {
  const { data } = await apiClient.get<OwnerProfile>("/owners/me/profile");
  return data;
}

export async function updateOwnerProfile(input: UpdateOwnerProfileInput): Promise<OwnerProfile> {
  const { data } = await apiClient.patch<OwnerProfile>("/owners/me/profile", input);

  return data;
}

export async function getProfileImageUploadUrl(
  input: PresignedUrlInput,
): Promise<PresignedUrlResponse> {
  const { data } = await apiClient.post<PresignedUrlResponse>(
    "/profile-images/presigned-url",
    input,
  );

  return data;
}

export async function uploadProfileImage(file: File): Promise<string> {
  if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/webp") {
    throw new Error("지원하지 않는 이미지 형식입니다.");
  }

  if (file.size < 1 || file.size > 5 * 1024 * 1024) {
    throw new Error("이미지는 5MB 이하로 등록해 주세요.");
  }

  const { uploadUrl, imageUrl } = await getProfileImageUploadUrl({
    contentType: file.type,
    fileSize: file.size,
  });

  // S3 presigned URL에는 인증용 apiClient를 사용하지 않습니다.
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
    timeout: 30000,
  });

  return imageUrl;
}
