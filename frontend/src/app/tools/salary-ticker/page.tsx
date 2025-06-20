import SalaryTicker from '@/features/time-efficiency/components/SalaryTicker';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function SalaryTickerPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <SalaryTicker locale={locale} />
    </div>
  );
}
