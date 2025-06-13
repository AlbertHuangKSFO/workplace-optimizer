'use client';

import { ToolGrid } from '@/components/tools/ToolGrid';
import { allTools } from '@/constants/tools';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section>
        <ToolGrid tools={allTools} />
      </section>
    </div>
  );
}
