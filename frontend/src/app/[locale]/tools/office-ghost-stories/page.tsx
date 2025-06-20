import OfficeGhostStories from '@/features/office-fun/components/OfficeGhostStories';
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
        <OfficeGhostStories locale={locale} />
      </div>
    </div>
  );
}
