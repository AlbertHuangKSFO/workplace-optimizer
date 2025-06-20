'use client';

import AntiPuaAssistant from '@/features/office-fun/AntiPuaAssistant';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';
import { ValidLocale } from '@/lib/i18n';

interface PageProps {
  params: Promise<{ locale: ValidLocale }>;
}

async function AntiPuaAssistantPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <AntiPuaAssistant locale={locale} />
    </Suspense>
  );
}

export default AntiPuaAssistantPage;
