import AuthGuard from "@/features/auth/components/AuthGuard/AuthGuard";
import type { ReactNode } from "react";

type SitterLayoutProps = {
  children: ReactNode;
};

export default function SitterLayout({ children }: SitterLayoutProps) {
  return <AuthGuard allowedRoles={["SITTER"]}>{children}</AuthGuard>;
}
