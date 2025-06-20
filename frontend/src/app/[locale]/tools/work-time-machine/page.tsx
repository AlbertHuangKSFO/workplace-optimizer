import WorkTimeMachine from '@/features/office-fun/components/WorkTimeMachine';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <WorkTimeMachine locale={locale} />;
}
