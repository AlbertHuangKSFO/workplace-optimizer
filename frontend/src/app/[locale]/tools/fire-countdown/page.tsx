import FireCountdown from '@/features/time-efficiency/components/FireCountdown';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function FireCountdownPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <FireCountdown locale={locale} />
    </div>
  );
}
