import type { UserRole } from "../types/auth";

export const SOCIAL_AUTH_STORAGE_KEY = "pot:social-auth";

export type SocialAuthPurpose = "login" | "signup" | "link";

export type PendingSocialAuth = {
  provider: "KAKAO" | "GOOGLE";
  purpose: SocialAuthPurpose;
  role: UserRole;
  state: string;
  redirectUri: string;
  startedAt: number;
  userId?: string;
};

export function startKakaoAuth(role: UserRole, purpose: SocialAuthPurpose, userId?: string) {
  const restApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!restApiKey || !redirectUri) {
    throw new Error("카카오 로그인 환경변수가 설정되지 않았습니다.");
  }

  if (purpose === "link" && !userId) {
    throw new Error("카카오 계정을 연결할 사용자 정보가 없습니다.");
  }

  const state = crypto.randomUUID();

  const pendingAuth: PendingSocialAuth = {
    provider: "KAKAO",
    purpose,
    role,
    state,
    redirectUri,
    startedAt: Date.now(),
    userId: purpose === "link" ? userId : undefined,
  };

  sessionStorage.setItem(SOCIAL_AUTH_STORAGE_KEY, JSON.stringify(pendingAuth));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: restApiKey,
    redirect_uri: redirectUri,
    state,
  });

  window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params}`);
}

export function consumeKakaoAuthState(state: string): PendingSocialAuth | null {
  const saved = sessionStorage.getItem(SOCIAL_AUTH_STORAGE_KEY);
  sessionStorage.removeItem(SOCIAL_AUTH_STORAGE_KEY);

  if (!saved || !state) return null;

  try {
    const pending = JSON.parse(saved) as PendingSocialAuth;
    const elapsed = Date.now() - pending.startedAt;

    if (
      pending.provider !== "KAKAO" ||
      (pending.purpose !== "login" && pending.purpose !== "signup" && pending.purpose !== "link") ||
      (pending.role !== "OWNER" && pending.role !== "SITTER") ||
      (pending.purpose === "link" && (typeof pending.userId !== "string" || !pending.userId)) ||
      pending.state !== state ||
      pending.redirectUri !== process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI ||
      typeof pending.startedAt !== "number" ||
      elapsed < 0 ||
      elapsed > 10 * 60 * 1000
    ) {
      return null;
    }

    return pending;
  } catch {
    return null;
  }
}

export function consumeKakaoCallback(): { code: string; pending: PendingSocialAuth } | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  const pending = consumeKakaoAuthState(state ?? "");

  if (!code || !pending) return null;

  return { code, pending };
}

export function hasPendingKakaoLink(): boolean {
  const saved = sessionStorage.getItem(SOCIAL_AUTH_STORAGE_KEY);

  if (!saved) return false;

  try {
    const pending = JSON.parse(saved) as Partial<PendingSocialAuth>;

    return pending?.provider === "KAKAO" && pending.purpose === "link";
  } catch {
    return false;
  }
}
