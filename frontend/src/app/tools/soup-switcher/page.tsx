import SoupSwitcher from '@/features/office-fun/SoupSwitcher';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function SoupSwitcherPage() {
  const locale = await getCurrentLocale();

  return <SoupSwitcher locale={locale} />;
}
