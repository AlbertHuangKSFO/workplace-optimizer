import SlackingIndexCalculator from '@/features/time-efficiency/components/SlackingIndexCalculator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function SlackingIndexCalculatorPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <SlackingIndexCalculator locale={locale} />
    </div>
  );
}
