import ProcrastinationBuster from "@/features/time-efficiency/components/ProcrastinationBuster";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function ProcrastinationBusterPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <ProcrastinationBuster locale={locale} />
    </div>
  );
}
