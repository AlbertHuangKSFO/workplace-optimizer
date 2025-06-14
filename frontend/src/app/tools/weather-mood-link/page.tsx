'use client';

import WeatherMoodLink from '@/features/intelligent-analysis/WeatherMoodLink';
import { Suspense } from 'react';

export default function WeatherMoodLinkPage() {
  return (
    <Suspense fallback={<div>Loading Weather Mood Link tool...</div>}>
      <WeatherMoodLink />
    </Suspense>
  );
}
