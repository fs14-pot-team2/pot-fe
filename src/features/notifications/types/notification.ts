export type NotificationType =
  | "QUOTE_RECEIVED"
  | "QUOTE_UPDATED"
  | "DESIGNATED_REQUEST_REJECTED"
  | "OWNER_CARE_STARTED"
  | "OWNER_CARE_ENDING"
  | "REVIEW_AVAILABLE"
  | "CARE_REQUEST_EXPIRING"
  | "DESIGNATED_REQUEST_RECEIVED"
  | "QUOTE_CONFIRMED"
  | "REVIEW_RECEIVED"
  | "CARE_REQUEST_CANCELED"
  | "CARE_REQUEST_EXPIRED"
  | "SITTER_CARE_STARTED"
  | "SITTER_CARE_ENDING";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListParams {
  cursor?: string;
  limit?: number;
}

export interface NotificationListResponse {
  items: Notification[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface UnreadNotificationResponse {
  hasUnreadNotification: boolean;
}
