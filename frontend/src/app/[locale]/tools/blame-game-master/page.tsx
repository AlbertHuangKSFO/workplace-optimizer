import { ValidLocale } from '@/lib/i18n';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function BlameGameMasterPage({ params }: PageProps) {
  const { locale } = await params;
  // Redirect to the actual blame-tactics page with locale
  redirect(`/${locale}/tools/blame-tactics`);
}
