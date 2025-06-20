import IntroductionToSlacking from '@/features/office-fun/IntroductionToSlacking';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <IntroductionToSlacking locale={locale} />;
}
