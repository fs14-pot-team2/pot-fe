import type { SitterListParams } from "./types/sitter";

export const sitterKeys = {
  all: ["sitters"] as const,
  lists: () => [...sitterKeys.all, "list"] as const,
  list: (params: SitterListParams) => [...sitterKeys.lists(), params] as const,
};
