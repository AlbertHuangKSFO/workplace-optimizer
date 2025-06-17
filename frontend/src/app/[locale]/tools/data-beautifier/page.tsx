import DataBeautifier from '@/features/generation/data-beautifier/DataBeautifier';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function DataBeautifierPage({ params }: PageProps) {
  const { locale } = await params;
  return <DataBeautifier />;
}
