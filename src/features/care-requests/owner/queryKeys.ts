export const careRequestKeys = {
  all: ["careRequests"] as const,
  active: () => [...careRequestKeys.all, "active"] as const,
  rejectedReason: (rejectedRequestId: string) =>
    [...careRequestKeys.all, "rejectedReason", rejectedRequestId] as const,
};
