import { apiClient } from "@/lib/api/apiClient";

import type {
  NotificationListParams,
  NotificationListResponse,
  UnreadNotificationResponse,
} from "../types/notification";

export async function getNotifications({
  cursor,
  limit = 8,
}: NotificationListParams = {}): Promise<NotificationListResponse> {
  const { data } = await apiClient.get<NotificationListResponse>("/notifications", {
    params: {
      cursor,
      limit,
    },
  });

  return data;
}

export async function getUnreadNotification(): Promise<UnreadNotificationResponse> {
  const { data } = await apiClient.get<UnreadNotificationResponse>("/notifications/unread");

  return data;
}
