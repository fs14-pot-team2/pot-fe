import type { UserRole } from "../types/auth";
import {
  consumeSocialCallback,
  hasPendingSocialLink,
  startSocialAuth,
  type PendingSocialAuth,
  type SocialAuthPurpose,
} from "./socialOAuth";

export function startKakaoAuth(role: UserRole, purpose: SocialAuthPurpose, userId?: string) {
  startSocialAuth("KAKAO", role, purpose, userId);
}

export function consumeKakaoCallback(): { code: string; pending: PendingSocialAuth } | null {
  return consumeSocialCallback("KAKAO");
}

export function hasPendingKakaoLink(): boolean {
  return hasPendingSocialLink("KAKAO");
}
