import axios, { type InternalAxiosRequestConfig } from "axios";
import { apiClient } from "../api/apiClient";
import { getAccessToken } from "./accessToken";

type AuthInterceptorOptions = {
  clearSession: () => void;
  getSessionVersion: () => number;
  refreshSession: (version: number) => Promise<string | null>;
};

function isRefreshAuthError(error: unknown) {
  return (
    axios.isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 401 &&
    (error.response?.data?.code === "REFRESH_TOKEN_INVALID" ||
      error.response?.data?.code === "UNAUTHORIZED")
  );
}

function isExpiredAccessToken(error: unknown) {
  return (
    axios.isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 401 &&
    error.response?.data?.code === "TOKEN_EXPIRED"
  );
}

function checkRequestSession(config: InternalAxiosRequestConfig, getSessionVersion: () => number) {
  if (config._authRetry && config._authSessionVersion !== getSessionVersion()) {
    return Promise.reject(new Error("인증 상태가 변경되었습니다."));
  }

  if (!config._authRetry) {
    config._authSessionVersion = getSessionVersion();
  }

  return config;
}

async function getFreshAccessToken(
  config: InternalAxiosRequestConfig,
  options: AuthInterceptorOptions,
) {
  const version = config._authSessionVersion;

  if (version === undefined || version !== options.getSessionVersion()) {
    return null;
  }

  const currentToken = getAccessToken();

  if (currentToken && config.headers.get("Authorization") !== `Bearer ${currentToken}`) {
    return currentToken;
  }

  return options.refreshSession(version);
}

export function installAuthInterceptors(options: AuthInterceptorOptions) {
  let guestRetrySession: { from: number; to: number } | null = null;

  const clearSessionForGuestRetry = () => {
    const from = options.getSessionVersion();

    options.clearSession();

    guestRetrySession = {
      from,
      to: options.getSessionVersion(),
    };
  };

  const retryWithoutToken = (config: InternalAxiosRequestConfig) => {
    if (
      !guestRetrySession ||
      config._authSessionVersion !== guestRetrySession.from ||
      options.getSessionVersion() !== guestRetrySession.to ||
      getAccessToken() !== null
    ) {
      return Promise.reject(new axios.CanceledError("인증 상태가 변경되었습니다."));
    }

    config._authSessionVersion = guestRetrySession.to;
    config.headers.delete("Authorization");

    return apiClient(config);
  };

  const requestId = apiClient.interceptors.request.use((config) =>
    checkRequestSession(config, options.getSessionVersion),
  );

  const responseId = apiClient.interceptors.response.use(
    (response) => {
      const version = response.config._authSessionVersion;

      const isAuthChangeRequest = [
        "/auth/login",
        "/auth/signup",
        "/auth/kakao",
        "/auth/google",
        "/auth/logout",
      ].includes(response.config.url ?? "");

      if (
        !isAuthChangeRequest &&
        version !== undefined &&
        version !== options.getSessionVersion()
      ) {
        throw new axios.CanceledError("인증 상태가 변경되었습니다.");
      }

      return response;
    },
    async (error: unknown) => {
      if (!axios.isAxiosError<{ code?: string }>(error) || !error.config) {
        return Promise.reject(error);
      }

      const config = error.config;

      if (config._authSessionVersion !== options.getSessionVersion()) {
        const canRetryAsGuest =
          config.authMode === "optional" &&
          !config._authRetry &&
          getAccessToken() === null &&
          (isExpiredAccessToken(error) ||
            (error.response?.status === 401 && error.response?.data?.code === "UNAUTHORIZED"));

        if (canRetryAsGuest) {
          config._authRetry = true;
          return retryWithoutToken(config);
        }

        return Promise.reject(error);
      }

      if (error.response?.status === 401 && error.response?.data?.code === "UNAUTHORIZED") {
        clearSessionForGuestRetry();

        if (config.authMode === "optional" && !config._authRetry) {
          config._authRetry = true;
          return retryWithoutToken(config);
        }
      }

      if (isExpiredAccessToken(error) && !config._authRetry) {
        config._authRetry = true;

        let token: string | null;

        try {
          token = await getFreshAccessToken(config, options);
        } catch (refreshError) {
          if (config._authSessionVersion !== options.getSessionVersion()) {
            if (config.authMode === "optional" && getAccessToken() === null) {
              return retryWithoutToken(config);
            }

            return Promise.reject(error);
          }

          if (isRefreshAuthError(refreshError)) {
            clearSessionForGuestRetry();

            if (config.authMode === "optional") {
              return retryWithoutToken(config);
            }
          }
          return Promise.reject(refreshError);
        }

        if (config._authSessionVersion !== options.getSessionVersion()) {
          if (config.authMode === "optional" && getAccessToken() === null) {
            return retryWithoutToken(config);
          }

          return Promise.reject(error);
        }

        if (!token) {
          return Promise.reject(new Error("인증 상태가 변경되었습니다."));
        }

        config.headers.set("Authorization", `Bearer ${token}`);

        return apiClient(config);
      }

      return Promise.reject(error);
    },
  );

  return () => {
    apiClient.interceptors.request.eject(requestId);
    apiClient.interceptors.response.eject(responseId);
  };
}
