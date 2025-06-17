'use client';

import AwesomeComplimentGenerator from '@/features/office-fun/AwesomeComplimentGenerator';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default async function AwesomeComplimentGeneratorPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-10">
      <AwesomeComplimentGenerator locale={locale} />
    </div>
  );
}
