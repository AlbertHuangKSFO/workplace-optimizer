import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getCurrentLocale } from "@/lib/server-locale";
import { getTranslator } from "@/lib/translations";
import "@/styles/globals.css";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslator(locale);

  return {
    title: t('homepage.title'),
    description: t('homepage.subtitle'),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  const lang = locale === 'zh-CN' ? 'zh-CN' : 'en-US';

  return (
    <html lang={lang}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
