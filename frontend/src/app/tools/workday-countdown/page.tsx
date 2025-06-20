import WorkdayCountdown from '@/features/time-efficiency/components/WorkdayCountdown';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function WorkdayCountdownPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <WorkdayCountdown locale={locale} />
    </div>
  );
}
