"use client";

import { useLayoutEffect, useRef } from "react";

export function usePreservedListHeight<T extends HTMLElement>(isListLoading: boolean) {
  const listRef = useRef<T>(null);
  const previousHeightRef = useRef(0);

  useLayoutEffect(() => {
    const element = listRef.current;

    if (!element) return;

    if (isListLoading) {
      element.style.minHeight = previousHeightRef.current ? `${previousHeightRef.current}px` : "";

      return;
    }

    element.style.minHeight = "";

    const updateHeight = () => {
      previousHeightRef.current = element.getBoundingClientRect().height;
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    observer.observe(element);

    return () => observer.disconnect();
  });

  return listRef;
}
