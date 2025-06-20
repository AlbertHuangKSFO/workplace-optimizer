import ParallelUniverseWorkSimulator from '@/features/office-fun/components/ParallelUniverseWorkSimulator';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4">
      <ParallelUniverseWorkSimulator locale={locale} />
    </div>
  );
}
