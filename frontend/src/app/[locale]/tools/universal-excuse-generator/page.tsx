import UniversalExcuseGenerator from "@/features/office-fun/UniversalExcuseGenerator";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function UniversalExcuseGeneratorPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <UniversalExcuseGenerator locale={locale} />
    </div>
  );
}
