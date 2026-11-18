import Footer from "@/components/layout/Footer/Footer";
import AuthHeader from "@/components/layout/Header/AuthHeader";
import ToastProvider from "@/components/ui/Toast/ToastProvider";
import AuthProvider from "@/lib/auth/AuthProvider";
import QueryProvider from "@/lib/react-query/QueryProvider";
import SseListener from "@/lib/sse/SseListener";
import "@/styles/reset.css";
import "@/styles/variables.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POT | Plant On Trust",
  description: "방문형 식물 돌봄 매칭 서비스",
  openGraph: {
    type: "website",
    title: "POT | Plant On Trust",
    description: "방문형 식물 돌봄 매칭 서비스",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <AuthProvider>
            <SseListener />
            <ToastProvider>
              <AuthHeader />
              {children}
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
