import SalaryTicker from '@/features/time-efficiency/components/SalaryTicker';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <SalaryTicker locale={locale} />;
}
