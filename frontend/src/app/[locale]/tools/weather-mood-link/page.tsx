import WeatherMoodLink from '@/features/intelligent-analysis/WeatherMoodLink';
import { getValidLocale, ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function WeatherMoodLinkPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = getValidLocale(locale) as ValidLocale;

  return <WeatherMoodLink locale={validLocale} />;
}
