import CareerLevelingSystem from '@/features/workplace-survival/CareerLevelingSystem';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function CareerLevelingSystemPage({ params }: PageProps) {
  const { locale } = await params;
  return <CareerLevelingSystem locale={locale} />;
}
