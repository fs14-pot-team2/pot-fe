import AuthGuard from "@/features/auth/components/AuthGuard/AuthGuard";
import SitterProfileGuard from "@/features/profiles/sitter/components/SitterProfileGuard/SitterProfileGuard";
import type { ReactNode } from "react";

type SitterLayoutProps = {
  children: ReactNode;
};

export default function SitterLayout({ children }: SitterLayoutProps) {
  return (
    <AuthGuard allowedRoles={["SITTER"]}>
      <SitterProfileGuard>{children}</SitterProfileGuard>
    </AuthGuard>
  );
}
