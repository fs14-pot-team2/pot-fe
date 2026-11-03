import Header from "@/components/layout/Header/Header";
import ToastProvider from "@/components/ui/Toast/ToastProvider";
import QueryProvider from "@/lib/react-query/QueryProvider";
import "@/styles/reset.css";
import "@/styles/variables.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POT | Plant On Trust",
  description: "방문형 식물 돌봄 매칭 서비스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <ToastProvider>
            <Header isLoggedIn={false} />
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
