'use client';

import { navigationLinks } from '@/constants/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils'; // Assuming shadcn/ui utils for cn
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null); // Added for hover effect

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleCategory = (label: string) => {
    setOpenCategories(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

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
        {navigationLinks.map((category) => {
          const categoryId = `submenu-${category.label.replace(/\\s+/g, '-').toLowerCase()}`;
          // 如果有直接链接，渲染为链接而不是分类
          if (category.href) {
            return (
              <Link
                key={category.label}
                href={category.href}
                className={cn(
                  'flex items-center w-full p-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                  'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100', // Theme-aware hover
                  {
                    'justify-center': isCollapsed,
                    'bg-sky-500 dark:bg-sky-600 text-white': pathname === category.href, // Active link
                  }
                )}
                aria-label={isCollapsed ? category.label : undefined}
              >
                <category.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{category.label}</span>}
              </Link>
            );
          }

          // 原有的分类逻辑
          return (
            <div
              key={category.label}
              className="relative" // For positioning the pop-out menu
              onMouseEnter={() => {
                if (isCollapsed && category.children && category.children.length > 0) {
                  setHoveredCategory(category.label);
                }
              }}
              onMouseLeave={() => {
                if (isCollapsed) {
                  setHoveredCategory(null);
                }
              }}
            >
              <button
                onClick={() => toggleCategory(category.label)}
                aria-expanded={!isCollapsed ? openCategories.includes(category.label) : (hoveredCategory === category.label)}
                aria-controls={(!isCollapsed && category.children && category.children.length > 0) ? categoryId : undefined}
                aria-haspopup={isCollapsed && category.children && category.children.length > 0 ? "menu" : undefined}
                aria-label={isCollapsed ? category.label : undefined}
                className={cn(
                  'flex items-center w-full p-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                  'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100', // Theme-aware hover
                  {
                    'justify-center': isCollapsed,
                    'text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700': openCategories.includes(category.label) && !isCollapsed, // Open category
                  }
                )}
              >
                <category.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{category.label}</span>}
                {!isCollapsed && category.children && category.children.length > 0 && (openCategories.includes(category.label) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </button>
              {/* Submenu for EXPANDED sidebar with animation */}
              {(!isCollapsed && category.children && category.children.length > 0) && (
                <ul
                  id={categoryId}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out mt-1 pl-4 space-y-1",
                    openCategories.includes(category.label) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {category.children.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center p-2.5 pl-5 rounded-md text-sm transition-colors duration-150',
                          'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100', // Theme-aware hover
                          pathname === link.href ? 'bg-sky-500 dark:bg-sky-600 text-white font-semibold' : 'text-neutral-500 dark:text-neutral-400', // Active & default text
                        )}
                        role="menuitem"
                      >
                        <link.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {/* Pop-out submenu for COLLAPSED sidebar on hover */}
              {isCollapsed && hoveredCategory === category.label && category.children && category.children.length > 0 && (
                   <div
                    className="absolute left-full top-0 ml-2 z-20 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg py-1"
                    role="menu"
                    aria-label={category.label}
                   >
                      {category.children.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          role="menuitem"
                        >
                          {link.label}
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
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100', // Theme-aware hover
            isCollapsed && 'justify-center'
          )}
        >
          {theme === 'dark' ? <Sun className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} /> : <Moon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />}
          {!isCollapsed && (theme === 'dark' ? '切换亮色' : '切换暗色')}
        </button>
         <button
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium',
            'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100', // Theme-aware hover
             isCollapsed && 'justify-center',
             !isCollapsed && 'mt-auto' // Push to bottom when expanded
          )}
        >
          {isCollapsed ? <ChevronsRight className="h-5 w-5 mx-auto" /> : <ChevronsLeft className="h-5 w-5 mr-3" />}
          {!isCollapsed && '收起侧栏'}
        </button>
      </div>
    </aside>
  );
}
