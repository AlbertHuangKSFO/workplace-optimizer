import DataBeautifier from '@/features/generation/data-beautifier/DataBeautifier';
import { getCurrentLocale } from '@/lib/server-locale';

export default async function DataBeautifierPage() {
  const locale = await getCurrentLocale();

  return <DataBeautifier locale={locale} />;
}
