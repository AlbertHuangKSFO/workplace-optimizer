import ColleaguePersonaAnalyzer from '@/features/intelligent-analysis/ColleaguePersonaAnalyzer';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function ColleaguePersonaAnalyzerPage() {
  const locale = await getCurrentLocale();

  return <ColleaguePersonaAnalyzer locale={locale} />;
}
