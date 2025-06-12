'use client';

import { navigationLinks } from '@/constants/navigation';
import { cn } from '@/lib/utils'; // Assuming shadcn/ui utils for cn
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, LogOut, Moon, Settings, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Placeholder: You might want to create a proper logo component
const Logo = ({ collapsed }: { collapsed: boolean }) => (
  <div className={`flex items-center justify-center h-14 border-b border-neutral-700 ${collapsed ? 'px-2' : 'px-6'}`}>
    {collapsed ? (
      <Settings className="h-6 w-6 text-sky-500" />
    ) : (
      <h1 className="text-xl font-semibold text-neutral-100 whitespace-nowrap">职场优化器</h1>
    )}
  </div>
);

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleCategory = (label: string) => {
    setOpenCategories(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  return (
    <aside
      className={cn(
        'flex flex-col bg-neutral-800 text-neutral-300 border-r border-neutral-700 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      <Logo collapsed={isCollapsed} />
      <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
        {navigationLinks.map((category) => (
          <div key={category.label}>
            <button
              onClick={() => toggleCategory(category.label)}
              className={cn(
                'flex items-center w-full p-2.5 rounded-md text-sm font-medium hover:bg-neutral-700 hover:text-neutral-100 transition-colors duration-150',
                {
                  'justify-center': isCollapsed,
                  'text-neutral-100 bg-neutral-700': openCategories.includes(category.label) && !isCollapsed,
                }
              )}
            >
              <category.icon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
              {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{category.label}</span>}
              {!isCollapsed && (openCategories.includes(category.label) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            </button>
            {(!isCollapsed && openCategories.includes(category.label)) && (
              <ul className="mt-1 pl-4 space-y-1">
                {category.children.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center p-2.5 pl-5 rounded-md text-sm hover:bg-neutral-700 hover:text-neutral-100 transition-colors duration-150',
                        pathname === link.href ? 'bg-sky-600 text-white font-semibold' : 'text-neutral-400',
                      )}
                    >
                      <link.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <span className="whitespace-nowrap">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {isCollapsed && openCategories.includes(category.label) && (
                 <div className="absolute left-full top-0 ml-2 z-20 w-48 bg-neutral-750 border border-neutral-700 rounded-md shadow-lg py-1">
                    {category.children.map((link) => (
                      <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-600">
                        {link.label}
                      </Link>
                    ))}
                  </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer controls */}
      <div className={cn('px-3 py-3 border-t border-neutral-700 space-y-2', isCollapsed && 'space-y-0 flex flex-col items-center')}>
        <button
          onClick={toggleTheme}
          title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium hover:bg-neutral-700 hover:text-neutral-100',
            isCollapsed && 'justify-center'
          )}
        >
          {isDarkTheme ? <Sun className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} /> : <Moon className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />}
          {!isCollapsed && (isDarkTheme ? '切换亮色' : '切换暗色')}
        </button>
        <button
          title="Logout"
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium hover:bg-red-600/20 hover:text-red-400 text-neutral-400',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className={cn('h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
          {!isCollapsed && '退出登录'}
        </button>
         <button
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className={cn(
            'w-full flex items-center p-2.5 rounded-md text-sm font-medium hover:bg-neutral-700 hover:text-neutral-100',
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
