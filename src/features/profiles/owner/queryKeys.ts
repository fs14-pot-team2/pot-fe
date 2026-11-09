export const ownerProfileKeys = {
  all: ["ownerProfile"] as const,
  detail: () => [...ownerProfileKeys.all, "detail"] as const,
};
