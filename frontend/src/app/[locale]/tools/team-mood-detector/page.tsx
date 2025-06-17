import TeamMoodDetector from '@/features/analysis/mood-detector/TeamMoodDetector';
import { getValidLocale, ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeamMoodDetectorPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = getValidLocale(locale) as ValidLocale;

  return <TeamMoodDetector locale={validLocale} />;
}
