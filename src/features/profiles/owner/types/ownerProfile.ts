import type { PartnerRegion, PartnerServiceType } from "@/types/partner";

export type OwnerProfile = {
  id: string;
  userId: string;
  profileImageUrl: string | null;
  preferredServiceTypes: PartnerServiceType[];
  livingRegion: PartnerRegion | null;
};

export type UpdateOwnerProfileInput = Partial<
  Pick<OwnerProfile, "profileImageUrl" | "preferredServiceTypes" | "livingRegion">
>;

export type PresignedUrlInput = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  fileSize: number;
};

export type PresignedUrlResponse = {
  uploadUrl: string;
  imageUrl: string;
  expiresIn: number;
};
