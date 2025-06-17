import BossRadar from '@/features/workplace-survival/BossRadar';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function BossRadarPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <BossRadar locale={locale} />
    </div>
  );
}
