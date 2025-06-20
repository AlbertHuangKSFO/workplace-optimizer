import DailySlackingAlmanac from '@/features/office-fun/DailySlackingAlmanac';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function DailySlackingAlmanacPage() {
  const locale = await getCurrentLocale();

  return <DailySlackingAlmanac locale={locale} />;
}
