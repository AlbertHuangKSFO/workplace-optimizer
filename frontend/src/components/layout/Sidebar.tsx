'use client';

import { FeatureConfig, homeNavigationLink, toolCategories, ToolCategoryConfig } from '@/constants/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

// Logo component with actual logo image
const Logo = ({ collapsed }: { collapsed: boolean }) => (
  <div className={cn(
    `flex items-center h-14 border-b`,
    collapsed ? 'justify-center px-2' : 'justify-start px-6',
    'border-neutral-200 dark:border-neutral-700' // Theme-aware border
  )}>
    {collapsed ? (
      <Image
        src="/logo.png"
        alt="Logo"
        width={32}
        height={32}
        className="rounded-lg"
      />
    ) : (
      <div className="flex items-center space-x-3">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 whitespace-nowrap">打工人必备工具</h1>
      </div>
    )}
  </div>
);

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategoryIds, setOpenCategoryIds] = useState<string[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleCategory = (categoryId: string) => {
    setOpenCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  // Memoize live features for performance if categories/features become very large
  const memoizedToolCategories = useMemo(() => {
    return toolCategories.map(category => ({
      ...category,
      features: category.features.filter(feature => feature.status === 'live'),
    })).filter(category => category.features.length > 0); // Only keep categories with live features
  }, []); // Dependencies: toolCategories (if it could change dynamically, otherwise empty array is fine)

  return (
    <aside
      className={cn(
        'flex flex-col border-r transition-all duration-300 ease-in-out',
        'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700', // Theme-aware base styles
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      <Logo collapsed={isCollapsed} />
      <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
        {/* Home Link */}
        <Link
          key={homeNavigationLink.id}
          href={homeNavigationLink.path}
          className={cn(
            'flex items-center w-full p-2.5 rounded-md text-sm font-medium transition-colors duration-150',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100',
            {
              'justify-center': isCollapsed,
              'bg-sky-500 dark:bg-sky-600 text-white': pathname === homeNavigationLink.path,
            }
          )}
          aria-label={isCollapsed ? homeNavigationLink.name : undefined}
        >
          <homeNavigationLink.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
          {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{homeNavigationLink.name}</span>}
        </Link>

        {/* Tool Categories */}
        {memoizedToolCategories.map((category: ToolCategoryConfig) => {
          const categorySubmenuId = `submenu-${category.id}`;
          const isOpen = openCategoryIds.includes(category.id);
          const isHovered = hoveredCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => {
                if (isCollapsed && category.features.length > 0) {
                  setHoveredCategoryId(category.id);
                }
              }}
              onMouseLeave={() => {
                if (isCollapsed) {
                  setHoveredCategoryId(null);
                }
              }}
            >
              <button
                onClick={() => toggleCategory(category.id)}
                aria-expanded={!isCollapsed ? isOpen : isHovered}
                aria-controls={(!isCollapsed && category.features.length > 0) ? categorySubmenuId : undefined}
                aria-haspopup={isCollapsed && category.features.length > 0 ? "menu" : undefined}
                aria-label={isCollapsed ? category.name : undefined}
                className={cn(
                  'flex items-center w-full p-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                  'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100',
                  {
                    'justify-center': isCollapsed,
                    'text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700': isOpen && !isCollapsed,
                  }
                )}
              >
                <category.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{category.name}</span>}
                {!isCollapsed && category.features.length > 0 && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </button>

              {/* Submenu for EXPANDED sidebar with animation */}
              {(!isCollapsed && category.features.length > 0) && (
                <ul
                  id={categorySubmenuId}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out mt-1 pl-4 space-y-1",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {category.features.map((feature: FeatureConfig) => (
                    <li key={feature.id}>
                      <Link
                        href={feature.path}
                        className={cn(
                          'flex items-center p-2.5 pl-5 rounded-md text-sm transition-colors duration-150',
                          'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100',
                          pathname === feature.path ? 'bg-sky-500 dark:bg-sky-600 text-white font-semibold' : 'text-neutral-500 dark:text-neutral-400',
                        )}
                        role="menuitem"
                      >
                        <feature.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{feature.shortName || feature.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Pop-out submenu for COLLAPSED sidebar on hover */}
              {isCollapsed && isHovered && category.features.length > 0 && (
                   <div
                    className="absolute left-full top-0 ml-2 z-20 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg py-1"
                    role="menu"
                    aria-label={category.name}
                   >
                      {category.features.map((feature: FeatureConfig) => (
                        <Link
                          key={feature.id}
                          href={feature.path}
                          className="block px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 w-full text-left"
                          role="menuitem"
                        >
                          <feature.icon className="h-4 w-4 mr-2 inline-block align-middle" />
                          <span className="align-middle">{feature.shortName || feature.name}</span>
                        </Link>
                      ))}
                    </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer controls */}
      <div className={cn(
        'px-3 py-3 border-t space-y-2',
        'border-neutral-200 dark:border-neutral-700', // Theme-aware border
        isCollapsed && 'space-y-0 flex flex-col items-center'
        )}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? '切换亮色' : '切换暗色'}
          aria-label={theme === 'dark' ? '切换亮色' : '切换暗色'}
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100',
            isCollapsed && 'justify-center'
          )}
        >
          {theme === 'dark' ? <Sun className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} /> : <Moon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />}
          {!isCollapsed && (theme === 'dark' ? '切换亮色' : '切换暗色')}
        </button>
         <button
          onClick={toggleSidebar}
          title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100',
            isCollapsed && 'justify-center'
          )}
        >
          {isCollapsed ? <ChevronsRight className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} /> : <ChevronsLeft className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />}
          {!isCollapsed && (isCollapsed ? '展开侧栏' : '收起侧栏')}
        </button>
      </div>
    </aside>
  );
}
