import EmailPolisher from '@/features/communication/email/EmailPolisher';
import { getValidLocale, ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function EmailPolisherPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = getValidLocale(locale) as ValidLocale;

  return <EmailPolisher locale={validLocale} />;
}
