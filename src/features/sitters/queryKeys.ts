import type { SitterListParams } from "./types/sitter";

export const sitterKeys = {
  all: ["sitters"] as const,
  lists: () => [...sitterKeys.all, "list"] as const,
  list: (params: SitterListParams) => [...sitterKeys.lists(), params] as const,
  details: () => [...sitterKeys.all, "detail"] as const,
  detail: (sitterId: string) => [...sitterKeys.details(), sitterId] as const,
};
