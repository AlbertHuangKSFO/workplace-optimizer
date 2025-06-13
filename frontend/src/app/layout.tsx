import { AppLayout } from "@/components/layout/AppLayout";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "打工人必备工具",
  description: "打工人的AI助手工具箱",
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
