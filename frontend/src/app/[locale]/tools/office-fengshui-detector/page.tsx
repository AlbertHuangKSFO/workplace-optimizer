import OfficeFengshuiDetector from '@/features/office-fun/OfficeFengshuiDetector';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <OfficeFengshuiDetector locale={locale} />;
}
