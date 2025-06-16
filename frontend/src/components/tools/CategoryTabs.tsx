'use client';

import { toolCategories, ToolCategoryKey } from '@/constants/tools'; // Assuming toolCategories is an array of categories
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  selectedCategory: ToolCategoryKey | 'all';
  onSelectCategory: (categoryKey: ToolCategoryKey | 'all') => void;
  className?: string;
}

export function CategoryTabs({ selectedCategory, onSelectCategory, className }: CategoryTabsProps) {
  return (
    <div className={cn("mb-6 overflow-x-auto pb-2", className)}>
      <div className="flex space-x-3 border-b border-neutral-700">
        <button
          key="all"
          onClick={() => onSelectCategory('all')}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap -mb-px border-b-2 transition-colors duration-150",
            selectedCategory === 'all'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-500'
          )}
        >
          全部工具
        </button>
        {toolCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.key}
              onClick={() => onSelectCategory(category.key)}
              className={cn(
                "flex items-center px-4 py-2.5 text-sm font-medium whitespace-nowrap -mb-px border-b-2 transition-colors duration-150",
                selectedCategory === category.key
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-500'
              )}
            >
              <Icon className="h-4 w-4 mr-2" />
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
