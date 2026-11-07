let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : accessToken;
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;

  accessToken = token;
}
