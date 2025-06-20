import CrossDepartmentTranslator from '@/features/translation/department/CrossDepartmentTranslator';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function CrossDepartmentTranslatorPage() {
  const locale = await getCurrentLocale();

  return <CrossDepartmentTranslator locale={locale} />;
}
