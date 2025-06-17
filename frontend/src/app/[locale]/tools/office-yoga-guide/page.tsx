import OfficeYogaGuide from "@/features/health-wellness/components/OfficeYogaGuide";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function OfficeYogaGuidePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-8">
      <OfficeYogaGuide locale={locale} />
    </div>
  );
}
