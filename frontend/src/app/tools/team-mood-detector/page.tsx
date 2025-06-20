import TeamMoodDetector from '@/features/analysis/mood-detector/TeamMoodDetector';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function TeamMoodDetectorPage() {
  const locale = await getCurrentLocale();

  return <TeamMoodDetector locale={locale} />;
}
