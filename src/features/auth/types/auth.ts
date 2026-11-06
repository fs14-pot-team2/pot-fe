export type UserRole = "OWNER" | "SITTER";
export type AuthMode = "login" | "signup";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface SignupInput {
  role: UserRole;
  email: string;
  nickname: string;
  password: string;
}

export interface LoginInput {
  role: UserRole;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LogoutResponse {
  message: string;
}
