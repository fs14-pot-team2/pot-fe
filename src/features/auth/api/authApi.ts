import { apiClient } from "@/lib/api/apiClient";
import axios from "axios";
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  LogoutResponse,
  RefreshResponse,
  SignupInput,
} from "../types/auth";
import type {
  GoogleAuthInput,
  GoogleAuthResponse,
  GoogleLinkInput,
  GoogleLinkResponse,
  KakaoAuthInput,
  KakaoAuthResponse,
  KakaoLinkInput,
  KakaoLinkResponse,
  SocialAuthInput,
  SocialAuthResponse,
  SocialLinkInput,
} from "../types/socialAuth";

import type { SocialProvider } from "../utils/socialOAuth";

export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", input);

  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input);

  return data;
}

async function loginWithSocial(
  provider: SocialProvider,
  input: SocialAuthInput,
): Promise<SocialAuthResponse> {
  const { data } = await apiClient.post<SocialAuthResponse>(
    `/auth/${provider.toLowerCase()}`,
    input,
  );

  return data;
}

export function loginWithKakao(input: KakaoAuthInput): Promise<KakaoAuthResponse> {
  return loginWithSocial("KAKAO", input);
}

export function loginWithGoogle(input: GoogleAuthInput): Promise<GoogleAuthResponse> {
  return loginWithSocial("GOOGLE", input);
}

async function signupWithSocial(
  provider: SocialProvider,
  signupToken: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    `/api/auth/${provider.toLowerCase()}/signup`,
    { password },
    {
      headers: { Authorization: `Bearer ${signupToken}` },
      withCredentials: true,
      timeout: 10000,
    },
  );

  return data;
}

export function signupWithKakao(signupToken: string, password: string): Promise<AuthResponse> {
  return signupWithSocial("KAKAO", signupToken, password);
}

export function signupWithGoogle(signupToken: string, password: string): Promise<AuthResponse> {
  return signupWithSocial("GOOGLE", signupToken, password);
}

export async function logout(): Promise<LogoutResponse> {
  const { data } = await apiClient.post<LogoutResponse>("/auth/logout");

  return data;
}

async function linkSocialAccount<TProvider extends SocialProvider>(
  provider: TProvider,
  input: SocialLinkInput,
): Promise<{ provider: TProvider }> {
  const { data } = await apiClient.post<{ provider: TProvider }>(
    `/users/me/social-accounts/${provider.toLowerCase()}`,
    input,
  );

  return data;
}

export function linkKakaoAccount(input: KakaoLinkInput): Promise<KakaoLinkResponse> {
  return linkSocialAccount("KAKAO", input);
}

export function linkGoogleAccount(input: GoogleLinkInput): Promise<GoogleLinkResponse> {
  return linkSocialAccount("GOOGLE", input);
}

let refreshPromise: Promise<RefreshResponse> | null = null;

export function refreshAccessToken(): Promise<RefreshResponse> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>("/api/auth/refresh", undefined, {
        withCredentials: true,
        timeout: 10000,
      })
      .then(({ data }) => data)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/users/me");

  return data;
}
