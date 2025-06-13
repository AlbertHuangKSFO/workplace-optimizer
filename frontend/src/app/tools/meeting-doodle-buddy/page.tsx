'use client';

import MeetingDoodleBuddy from '@/features/office-fun/MeetingDoodleBuddy';
import { Loader2 } from 'lucide-react';
import React, { Suspense } from 'react';

function MeetingDoodleBuddyPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <MeetingDoodleBuddy />
    </Suspense>
  );
}

export default MeetingDoodleBuddyPage;
