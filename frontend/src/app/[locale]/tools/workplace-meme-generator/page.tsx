import WorkplaceMemeGenerator from '@/features/analysis/meme-generator/WorkplaceMemeGenerator';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-neutral-900">
      <WorkplaceMemeGenerator locale={locale} />
    </div>
  );
}
