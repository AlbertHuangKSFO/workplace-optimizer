import FireCountdown from '@/features/time-efficiency/components/FireCountdown';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function FireCountdownPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <FireCountdown locale={locale} />
    </div>
  );
}
