import UniversalExcuseGenerator from '@/features/office-fun/UniversalExcuseGenerator';
import { getCurrentLocale } from '@/lib/server-locale';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

async function UniversalExcuseGeneratorPage(): Promise<React.JSX.Element> {
  const locale = await getCurrentLocale();

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <UniversalExcuseGenerator locale={locale} />
    </Suspense>
  );
}

export default UniversalExcuseGeneratorPage;
