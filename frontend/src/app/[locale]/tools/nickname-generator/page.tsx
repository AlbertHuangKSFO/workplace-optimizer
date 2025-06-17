import NicknameGenerator from "@/features/content-creation/NicknameGenerator";
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function NicknameGeneratorPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <NicknameGenerator locale={locale} />
    </div>
  );
}
