'use client';

import AwesomeComplimentGenerator from '@/features/office-fun/AwesomeComplimentGenerator';
import { ValidLocale } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

interface PageProps {
  params: Promise<{ locale: ValidLocale }>;
}

async function AwesomeComplimentGeneratorPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <AwesomeComplimentGenerator locale={locale} />
    </Suspense>
  );
}

export default AwesomeComplimentGeneratorPage;
