import BossRadar from '@/features/workplace-survival/BossRadar';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function BossRadarPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center">
      <BossRadar locale={locale} />
    </div>
  );
}
