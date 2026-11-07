"use client";

import { useQuery } from "@tanstack/react-query";

import { getSitterMyPage } from "../api/sitterMyPageApi";

export const sitterMyPageQueryKey = ["sitters", "me"] as const;

export function useSitterMyPage() {
  return useQuery({
    queryKey: sitterMyPageQueryKey,
    queryFn: getSitterMyPage,
    retry: false,
  });
}
