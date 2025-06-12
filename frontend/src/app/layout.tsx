import { AppLayout } from "@/components/layout/AppLayout";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "职场沟通优化器",
  description: "您的AI职场沟通助理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased bg-gray-800 text-gray-100">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
