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

export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", input);

  return data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", input);

  return data;
}

export async function logout(): Promise<LogoutResponse> {
  const { data } = await apiClient.post<LogoutResponse>("/auth/logout");

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
