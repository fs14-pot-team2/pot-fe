import axios from "axios";
import { getAccessToken } from "../auth/accessToken";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});
