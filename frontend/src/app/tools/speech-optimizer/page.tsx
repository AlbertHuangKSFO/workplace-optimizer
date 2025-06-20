import SpeechOptimizer from '@/features/communication/optimizer/SpeechOptimizer';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function SpeechOptimizerPage() {
  const locale = await getCurrentLocale();

  return <SpeechOptimizer locale={locale} />;
}
