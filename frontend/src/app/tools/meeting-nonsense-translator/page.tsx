import MeetingNonsenseTranslator from '@/features/communication/MeetingNonsenseTranslator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function MeetingNonsenseTranslatorPage() {
  const locale = await getCurrentLocale();

  return <MeetingNonsenseTranslator locale={locale} />;
}
