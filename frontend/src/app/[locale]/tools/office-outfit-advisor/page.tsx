import OfficeOutfitAdvisor from '@/features/office-fun/OfficeOutfitAdvisor';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <OfficeOutfitAdvisor locale={locale} />;
}
