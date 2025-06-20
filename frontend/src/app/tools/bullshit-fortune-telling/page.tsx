import BullshitFortuneTelling from '@/features/office-fun/BullshitFortuneTelling';
import { getCurrentLocale } from '@/lib/server-locale';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

async function BullshitFortuneTellingPage(): Promise<React.JSX.Element> {
  const locale = await getCurrentLocale();

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <BullshitFortuneTelling locale={locale} />
    </Suspense>
  );
}

export default BullshitFortuneTellingPage;
