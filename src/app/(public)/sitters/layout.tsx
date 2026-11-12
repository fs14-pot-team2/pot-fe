import SittersAccessGuard from "@/features/sitters/components/SittersAccessGuard";
import type { ReactNode } from "react";

type SittersLayoutProps = {
  children: ReactNode;
};

export default function SittersLayout({ children }: SittersLayoutProps) {
  return <SittersAccessGuard>{children}</SittersAccessGuard>;
}
