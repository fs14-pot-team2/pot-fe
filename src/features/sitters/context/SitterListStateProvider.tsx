"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useState,
} from "react";

type SearchDraft = {
  keyword: string;
  text: string;
};

type SitterListContextValue = {
  searchDraft: SearchDraft | null;
  setSearchDraft: Dispatch<SetStateAction<SearchDraft | null>>;
};

const SitterListContext = createContext<SitterListContextValue | null>(null);

function SitterListStateScope({ children }: { children: ReactNode }) {
  const [searchDraft, setSearchDraft] = useState<SearchDraft | null>(null);

  return (
    <SitterListContext.Provider value={{ searchDraft, setSearchDraft }}>
      {children}
    </SitterListContext.Provider>
  );
}

export default function SitterListStateProvider({ children }: { children: ReactNode }) {
  const { sessionRevision } = useAuth();

  return <SitterListStateScope key={sessionRevision}>{children}</SitterListStateScope>;
}

export function useSitterListState() {
  const context = useContext(SitterListContext);

  if (!context) {
    throw new Error("SitterListStateProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
