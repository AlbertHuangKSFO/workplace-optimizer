import MeetingSpeechGenerator from '@/features/communication/meeting/MeetingSpeechGenerator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function MeetingSpeechGeneratorPage() {
  const locale = await getCurrentLocale();

  return <MeetingSpeechGenerator locale={locale} />;
}
