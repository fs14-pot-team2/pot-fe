import SittersAccessGuard from "@/features/sitters/components/SittersAccessGuard";
import SitterListStateProvider from "@/features/sitters/context/SitterListStateProvider";
import type { ReactNode } from "react";

type SittersLayoutProps = {
  children: ReactNode;
};

export default function SittersLayout({ children }: SittersLayoutProps) {
  return (
    <SittersAccessGuard>
      <SitterListStateProvider>{children}</SitterListStateProvider>
    </SittersAccessGuard>
  );
}
