import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    authMode?: "required" | "optional";
    _authRetry?: boolean;
    _authSessionVersion?: number;
  }
}
