import StealthSpendingLog from "@/features/health-wellness/components/StealthSpendingLog";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-8">
      <StealthSpendingLog locale={locale} />
    </div>
  );
}
