import WeeklyReportSparkleEnhancer from '@/features/office-fun/WeeklyReportSparkleEnhancer';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <WeeklyReportSparkleEnhancer locale={locale} />;
}
