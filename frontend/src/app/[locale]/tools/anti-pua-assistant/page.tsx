'use client';

import AntiPuaAssistant from '@/features/office-fun/AntiPuaAssistant';
import { ValidLocale } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

interface PageProps {
  params: Promise<{
    locale: ValidLocale;
  }>;
}

export default function AntiPuaAssistantPage({ params }: PageProps): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <AntiPuaAssistant />
    </Suspense>
  );
}
