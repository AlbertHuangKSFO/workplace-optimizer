import WorkerMemeGeneratorPro from '@/features/content-creation/components/WorkerMemeGeneratorPro';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <WorkerMemeGeneratorPro locale={locale} />;
}
