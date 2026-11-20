import type { AuthResponse, UserRole } from "./auth";

export type KakaoAuthInput = {
  role: UserRole;
  code: string;
  redirectUri: string;
};

export type KakaoAuthResponse =
  ({ isNewUser: false } & AuthResponse) | { isNewUser: true; signupToken: string };

export type KakaoLinkInput = Pick<KakaoAuthInput, "code" | "redirectUri">;

export type KakaoLinkResponse = { provider: "KAKAO" };
