import type { UserRole } from "../types/auth";
import {
  consumeSocialCallback,
  hasPendingSocialLink,
  startSocialAuth,
  type PendingSocialAuth,
  type SocialAuthPurpose,
} from "./socialOAuth";

export function startGoogleAuth(role: UserRole, purpose: SocialAuthPurpose, userId?: string) {
  startSocialAuth("GOOGLE", role, purpose, userId);
}

export function consumeGoogleCallback(): { code: string; pending: PendingSocialAuth } | null {
  return consumeSocialCallback("GOOGLE");
}

export function hasPendingGoogleLink(): boolean {
  return hasPendingSocialLink("GOOGLE");
}
