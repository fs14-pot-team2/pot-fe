import { refreshAccessToken } from "@/features/auth/api/authApi";
import axios, { type InternalAxiosRequestConfig } from "axios";
import { apiClient } from "../api/apiClient";
import { getAccessToken, setAccessToken } from "./accessToken";

type AuthInterceptorOptions = {
  clearSession: () => void;
  getSessionVersion: () => number;
};

function isInvalidRefreshToken(error: unknown) {
  return (
    axios.isAxiosError<{ code?: string }>(error) &&
    error.response?.status === 401 &&
    error.response?.data?.code === "REFRESH_TOKEN_INVALID"
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

async function getFreshAccessToken(config: InternalAxiosRequestConfig) {
  const currentToken = getAccessToken();

  if (currentToken && config.headers.get("Authorization") !== `Bearer ${currentToken}`) {
    return currentToken;
  }

  const { accessToken } = await refreshAccessToken();
  return accessToken;
}

export function installAuthInterceptors(options: AuthInterceptorOptions) {
  const retryWithoutToken = (config: InternalAxiosRequestConfig) => {
    config._authSessionVersion = options.getSessionVersion();
    config.headers.delete("Authorization");

    return apiClient(config);
  };

  const requestId = apiClient.interceptors.request.use((config) =>
    checkRequestSession(config, options.getSessionVersion),
  );

  const responseId = apiClient.interceptors.response.use(
    (response) => response,
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
        options.clearSession();

        if (config.authMode === "optional" && !config._authRetry) {
          config._authRetry = true;
          return retryWithoutToken(config);
        }
      }

      if (isExpiredAccessToken(error) && !config._authRetry) {
        config._authRetry = true;

        let token: string;

        try {
          token = await getFreshAccessToken(config);
        } catch (refreshError) {
          if (config._authSessionVersion !== options.getSessionVersion()) {
            if (config.authMode === "optional" && getAccessToken() === null) {
              return retryWithoutToken(config);
            }

            return Promise.reject(error);
          }

          if (isInvalidRefreshToken(refreshError)) {
            options.clearSession();

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

        setAccessToken(token);
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
