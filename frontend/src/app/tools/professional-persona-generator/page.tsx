import ProfessionalPersonaGenerator from '@/features/generation/persona/ProfessionalPersonaGenerator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function ProfessionalPersonaGeneratorPage() {
  const locale = await getCurrentLocale();

  return <ProfessionalPersonaGenerator locale={locale} />;
}
