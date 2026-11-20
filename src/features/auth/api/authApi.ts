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
  KakaoAuthInput,
  KakaoAuthResponse,
  KakaoLinkInput,
  KakaoLinkResponse,
} from "../types/socialAuth";

export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", input);

  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input);

  return data;
}

export async function loginWithKakao(input: KakaoAuthInput): Promise<KakaoAuthResponse> {
  const { data } = await apiClient.post<KakaoAuthResponse>("/auth/kakao", input);

  return data;
}

export async function signupWithKakao(
  signupToken: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await axios.post<AuthResponse>(
    "/api/auth/kakao/signup",
    { password },
    {
      headers: { Authorization: `Bearer ${signupToken}` },
      withCredentials: true,
      timeout: 10000,
    },
  );

  return data;
}

export async function logout(): Promise<LogoutResponse> {
  const { data } = await apiClient.post<LogoutResponse>("/auth/logout");

  return data;
}

export async function linkKakaoAccount(input: KakaoLinkInput): Promise<KakaoLinkResponse> {
  const { data } = await apiClient.post<KakaoLinkResponse>(
    "/users/me/social-accounts/kakao",
    input,
  );

  return data;
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
