import ProcrastinationBuster from '@/features/time-efficiency/components/ProcrastinationBuster';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function ProcrastinationBusterPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProcrastinationBuster locale={locale} />
    </div>
  );
}
