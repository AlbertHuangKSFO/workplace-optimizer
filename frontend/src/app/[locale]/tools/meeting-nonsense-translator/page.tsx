import MeetingNonsenseTranslator from '@/features/communication/MeetingNonsenseTranslator';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: {
    locale: ValidLocale;
  };
}

export default function MeetingNonsenseTranslatorPage({ params }: PageProps) {
  return <MeetingNonsenseTranslator locale={params.locale} />;
}
