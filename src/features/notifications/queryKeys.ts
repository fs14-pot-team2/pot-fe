export const notificationKeys = {
  all: ["notifications"] as const,

  lists: () => [...notificationKeys.all, "list"] as const,

  list: (limit: number) => [...notificationKeys.lists(), { limit }] as const,

  unread: () => [...notificationKeys.all, "unread"] as const,
};
