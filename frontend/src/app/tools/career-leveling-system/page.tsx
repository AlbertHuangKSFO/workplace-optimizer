import CareerLevelingSystem from '@/features/workplace-survival/CareerLevelingSystem';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function CareerLevelingSystemPage() {
  const locale = await getCurrentLocale();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <CareerLevelingSystem locale={locale} />
    </div>
  );
}
