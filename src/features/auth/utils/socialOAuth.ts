import type { UserRole } from "../types/auth";

export const SOCIAL_AUTH_STORAGE_KEY = "pot:social-auth";

export type SocialProvider = "KAKAO" | "GOOGLE";
export type SocialAuthPurpose = "login" | "signup" | "link";

export type PendingSocialAuth = {
  provider: SocialProvider;
  purpose: SocialAuthPurpose;
  role: UserRole;
  state: string;
  redirectUri: string;
  startedAt: number;
  userId?: string;
};

const PROVIDER_SETTINGS = {
  KAKAO: {
    clientId: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
    redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
  },
  GOOGLE: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  },
} as const;

export function startSocialAuth(
  provider: SocialProvider,
  role: UserRole,
  purpose: SocialAuthPurpose,
  userId?: string,
) {
  const { clientId, redirectUri, authorizeUrl } = PROVIDER_SETTINGS[provider];

  if (!clientId || !redirectUri) {
    throw new Error("소셜 로그인 환경변수가 설정되지 않았습니다.");
  }

  if (purpose === "link" && !userId) {
    throw new Error("소셜 계정을 연결할 사용자 정보가 없습니다.");
  }

  const state = crypto.randomUUID();

  const pendingAuth: PendingSocialAuth = {
    provider,
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
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });

  if (provider === "GOOGLE") {
    params.set("scope", "openid email");
  }

  const oauthUrl = new URL(authorizeUrl);
  oauthUrl.search = params.toString();

  window.location.assign(oauthUrl.toString());
}

export function consumeSocialAuthState(
  provider: SocialProvider,
  state: string,
): PendingSocialAuth | null {
  const saved = sessionStorage.getItem(SOCIAL_AUTH_STORAGE_KEY);
  sessionStorage.removeItem(SOCIAL_AUTH_STORAGE_KEY);

  if (!saved || !state) return null;

  try {
    const pending = JSON.parse(saved) as PendingSocialAuth;

    if (typeof pending.startedAt !== "number") return null;

    const elapsed = Date.now() - pending.startedAt;

    if (
      pending.provider !== provider ||
      (pending.purpose !== "login" && pending.purpose !== "signup" && pending.purpose !== "link") ||
      (pending.role !== "OWNER" && pending.role !== "SITTER") ||
      (pending.purpose === "link" && (typeof pending.userId !== "string" || !pending.userId)) ||
      pending.state !== state ||
      pending.redirectUri !== PROVIDER_SETTINGS[provider].redirectUri ||
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

export function consumeSocialCallback(
  provider: SocialProvider,
): { code: string; pending: PendingSocialAuth } | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  const pending = consumeSocialAuthState(provider, state ?? "");

  if (!code || !pending) return null;

  return { code, pending };
}

export function hasPendingSocialLink(provider: SocialProvider): boolean {
  const saved = sessionStorage.getItem(SOCIAL_AUTH_STORAGE_KEY);

  if (!saved) return false;

  try {
    const pending = JSON.parse(saved) as Partial<PendingSocialAuth> | null;

    return pending?.provider === provider && pending.purpose === "link";
  } catch {
    return false;
  }
}
