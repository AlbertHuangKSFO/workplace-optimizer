import IntroductionToSlacking from '@/features/office-fun/IntroductionToSlacking';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function IntroductionToSlackingPage() {
  const locale = await getCurrentLocale();

  return <IntroductionToSlacking locale={locale} />;
}
