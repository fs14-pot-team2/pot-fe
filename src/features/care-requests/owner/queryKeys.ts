export const careRequestKeys = {
  all: ["careRequests"] as const,
  active: () => [...careRequestKeys.all, "active"] as const,
};
