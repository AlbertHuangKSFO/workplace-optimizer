import ProSlackersTimeManager from '@/features/office-fun/ProSlackersTimeManager';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <ProSlackersTimeManager locale={locale} />
      </div>
    </div>
  );
}
