import CaffeineDependencyIndex from '@/features/health-wellness/components/CaffeineDependencyIndex';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function CaffeineDependencyIndexPage({ params }: PageProps) {
  const { locale } = await params;

  return <CaffeineDependencyIndex locale={locale} />;
}
