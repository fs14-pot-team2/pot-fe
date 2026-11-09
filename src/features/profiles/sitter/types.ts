import type { PartnerRegion, PartnerServiceType } from "@/types/partner";

export type PartnerGender = "MALE" | "FEMALE";

export interface PartnerProfileValues {
  profileImageUrl: string | null;
  gender: PartnerGender | "";
  shortIntroduction: string;
  description: string;
  serviceTypes: PartnerServiceType[];
  serviceRegions: PartnerRegion[];
}

export interface CreatePartnerProfileRequest {
  profileImageUrl: string | null;
  gender: PartnerGender;
  shortIntroduction: string;
  description: string | null;
  serviceTypes: PartnerServiceType[];
  serviceRegions: PartnerRegion[];
}

export interface PartnerProfileResponse extends CreatePartnerProfileRequest {
  id: string;
  userId: string;
}

export type UpdatePartnerProfileRequest = CreatePartnerProfileRequest;

export type ProfileImageContentType = "image/jpeg" | "image/png" | "image/webp";

export interface ProfileImagePresignedUrlRequest {
  contentType: ProfileImageContentType;
  fileSize: number;
}

export interface ProfileImagePresignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  expiresIn: number;
}
