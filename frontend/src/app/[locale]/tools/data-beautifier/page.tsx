import DataBeautifier from '@/features/generation/data-beautifier/DataBeautifier';
import { getValidLocale, ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DataBeautifierPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = getValidLocale(locale) as ValidLocale;

  return <DataBeautifier locale={validLocale} />;
}
