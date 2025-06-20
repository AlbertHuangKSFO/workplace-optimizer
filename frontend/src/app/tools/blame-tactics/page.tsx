import BlameTactics from '@/features/crisis/tactics/BlameTactics';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function BlameTacticsPage() {
  const locale = await getCurrentLocale();

  return <BlameTactics locale={locale} />;
}
