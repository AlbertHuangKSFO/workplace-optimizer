'use client';

import { Tool } from '@/constants/tools';
import { cn } from '@/lib/utils';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: Tool[];
  className?: string;
}

export function ToolGrid({ tools, className }: ToolGridProps) {
  if (!tools || tools.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-400">
        <p>没有找到相关的工具。</p>
        <p>尝试调整您的筛选条件或稍后再试。</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
