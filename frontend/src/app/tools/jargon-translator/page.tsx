import JargonTranslator from '@/features/translation/jargon/JargonTranslator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function JargonTranslatorPage() {
  const locale = await getCurrentLocale();

  return <JargonTranslator locale={locale} />;
}
