import CrisisCommunicationTemplates from '@/features/crisis/pr/CrisisCommunicationTemplates';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function CrisisCommunicationTemplatesPage({ params }: PageProps) {
  const { locale } = await params;
  return <CrisisCommunicationTemplates locale={locale} />;
}
