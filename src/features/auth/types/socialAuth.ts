import type { AuthResponse, UserRole } from "./auth";

export type SocialAuthInput = {
  role: UserRole;
  code: string;
  redirectUri: string;
};

export type SocialAuthResponse =
  ({ isNewUser: false } & AuthResponse) | { isNewUser: true; signupToken: string };

export type SocialLinkInput = Pick<SocialAuthInput, "code" | "redirectUri">;

export type KakaoAuthInput = SocialAuthInput;
export type KakaoAuthResponse = SocialAuthResponse;
export type KakaoLinkInput = SocialLinkInput;
export type KakaoLinkResponse = { provider: "KAKAO" };

export type GoogleAuthInput = SocialAuthInput;
export type GoogleAuthResponse = SocialAuthResponse;
export type GoogleLinkInput = SocialLinkInput;
export type GoogleLinkResponse = { provider: "GOOGLE" };
