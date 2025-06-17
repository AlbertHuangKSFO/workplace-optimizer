import BullshitFortuneTelling from "@/features/office-fun/BullshitFortuneTelling";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function BullshitFortunetellingPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <BullshitFortuneTelling locale={locale} />
    </div>
  );
}
