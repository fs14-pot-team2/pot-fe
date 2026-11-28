"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SitterListState } from "../types/sitter";
import { readSitterListState, toSitterListSearchParams } from "../utils/sitterListUrl";

type HistoryMode = "push" | "replace";

export function useSitterListUrlState() {
  const searchParams = useSearchParams();
  const listState = readSitterListState(searchParams);

  const setListState = useCallback(
    (update: (current: SitterListState) => SitterListState, mode: HistoryMode = "push") => {
      const currentSearch = window.location.search;
      const currentState = readSitterListState(new URLSearchParams(currentSearch));
      const nextState = update(currentState);

      const currentStateKey = toSitterListSearchParams(currentState).toString();
      const nextStateKey = toSitterListSearchParams(nextState).toString();

      if (mode === "push" && currentStateKey === nextStateKey) return;

      const nextSearch = toSitterListSearchParams(nextState, currentSearch).toString();

      const nextUrl =
        window.location.pathname + (nextSearch ? `?${nextSearch}` : "") + window.location.hash;

      if (mode === "replace") {
        window.history.replaceState(null, "", nextUrl);
      } else {
        window.history.pushState(null, "", nextUrl);
      }
    },
    [],
  );

  return { listState, setListState };
}
