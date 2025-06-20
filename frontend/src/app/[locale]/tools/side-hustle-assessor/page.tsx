import SideHustleAssessor from '@/features/workplace-survival/SideHustleAssessor';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function SideHustleAssessorPage({ params }: PageProps) {
  const { locale } = await params;
  return <SideHustleAssessor locale={locale} />;
}
