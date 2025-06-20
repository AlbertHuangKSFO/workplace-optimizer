import SlackingIndexCalculator from '@/features/time-efficiency/components/SlackingIndexCalculator';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <SlackingIndexCalculator locale={locale} />;
}
