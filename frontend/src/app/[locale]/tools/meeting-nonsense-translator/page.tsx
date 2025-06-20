import MeetingNonsenseTranslator from '@/features/communication/MeetingNonsenseTranslator';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function MeetingNonsenseTranslatorPage({ params }: PageProps) {
  const { locale } = await params;
  return <MeetingNonsenseTranslator locale={locale} />;
}
