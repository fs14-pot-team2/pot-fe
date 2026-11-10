import { apiClient } from "@/lib/api/apiClient";
import type { UserRole } from "@/features/auth/types/auth";

interface VerifiedUser {
  id: string;
  role: UserRole;
  email: string;
  nickname: string;
}

interface VerifyPasswordInput {
  password: string;
}

interface VerifyPasswordResponse {
  user: VerifiedUser;
}

export interface UpdateAccountInput {
  nickname?: string;
  password?: string;
}

interface UpdateAccountResponse {
  id: string;
  role: UserRole;
  email: string;
  nickname: string;
  updatedAt: string;
}

export async function verifyPassword(input: VerifyPasswordInput): Promise<VerifyPasswordResponse> {
  const { data } = await apiClient.post<VerifyPasswordResponse>("/users/me/verify-password", input);

  return data;
}

export async function updateAccount(input: UpdateAccountInput): Promise<UpdateAccountResponse> {
  const { data } = await apiClient.patch<UpdateAccountResponse>("/users/me", input);

  return data;
}
