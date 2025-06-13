'use client';

import LunchDecisionOverlord from '@/features/office-fun/LunchDecisionOverlord';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

function LunchDecisionOverlordPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <LunchDecisionOverlord />
    </Suspense>
  );
}

export default LunchDecisionOverlordPage;
