import DailyGrindAffirmations from "@/features/office-fun/DailyGrindAffirmations";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function DailyGrindAffirmationsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <DailyGrindAffirmations locale={locale} />
    </div>
  );
}
