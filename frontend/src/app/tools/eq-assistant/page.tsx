import EQAssistant from '@/features/translation/eq-assistant/EQAssistant';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function EQAssistantPage() {
  const locale = await getCurrentLocale();

  return <EQAssistant locale={locale} />;
}
