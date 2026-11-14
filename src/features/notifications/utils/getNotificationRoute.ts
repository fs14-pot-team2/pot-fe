import type { UserRole } from "@/features/auth/types/auth";
import type { NotificationType } from "../types/notification";

type NotificationRouteMap = Partial<Record<NotificationType, string>>;

const OWNER_NOTIFICTION_ROUTES: NotificationRouteMap = {
  QUOTE_RECEIVED: "/owner/quotes",
  QUOTE_UPDATED: "/owner/quotes",
  DESIGNATED_REQUEST_REJECTED: "/owner/quotes",
  CARE_REQUEST_EXPIRING: "/owner/quotes",
  OWNER_CARE_STARTED: "/owner/quotes/history",
  OWNER_CARE_ENDING: "/owner/quotes/history",
  REVIEW_AVAILABLE: "/owner/reviews/available",
};

const SITTER_NOTIFICATION_ROUTES: NotificationRouteMap = {
  DESIGNATED_REQUEST_RECEIVED: "/sitter/requests",
  QUOTE_CONFIRMED: "/sitter/quotes",
  CARE_REQUEST_CANCELED: "/sitter/quotes",
  CARE_REQUEST_EXPIRED: "/sitter/quotes",
  SITTER_CARE_STARTED: "/sitter/quotes",
  SITTER_CARE_ENDING: "/sitter/quotes",
  REVIEW_RECEIVED: "/sitter/my",
};

export function getNotificationRoute(type: NotificationType, role: UserRole): string | null {
  const routes = role === "OWNER" ? OWNER_NOTIFICTION_ROUTES : SITTER_NOTIFICATION_ROUTES;

  return routes[type] ?? null;
}
