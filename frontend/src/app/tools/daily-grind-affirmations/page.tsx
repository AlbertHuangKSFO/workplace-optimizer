'use client';

import DailyGrindAffirmations from '@/features/office-fun/DailyGrindAffirmations';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

function DailyGrindAffirmationsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <DailyGrindAffirmations />
    </Suspense>
  );
}

export default DailyGrindAffirmationsPage;
