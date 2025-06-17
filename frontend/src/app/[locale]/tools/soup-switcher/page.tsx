import SoupSwitcher from "@/features/office-fun/SoupSwitcher";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function SoupSwitcherPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <SoupSwitcher locale={locale} />
    </div>
  );
}
