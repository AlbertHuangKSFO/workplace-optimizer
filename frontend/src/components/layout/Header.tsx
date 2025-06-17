'use client';

import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Github, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ModelSelector } from './ModelSelector';

// Placeholder for ModelSelector, to be created later as per docs
// import ModelSelector from './ModelSelector';

export function Header() {
  const githubUrl = 'https://github.com/AlbertHuangKSFO/workplace-optimizer';
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [locale, setLocale] = useState<ValidLocale>('zh-CN');
  const pathname = usePathname();
  const { t, loading: translationsLoading } = useTranslations(locale);

  // Extract locale from pathname
  useEffect(() => {
    const pathParts = pathname.split('/');
    if (pathParts[1] && (pathParts[1] === 'en-US' || pathParts[1] === 'zh-CN')) {
      setLocale(pathParts[1] as ValidLocale);
    } else {
      setLocale('zh-CN'); // Default locale
    }
  }, [pathname]);

  console.log('[Header] Current selectedModelId state:', selectedModelId);

  const handleModelSelect = useCallback((modelId: string) => {
    console.log('[Header] handleModelSelect called with:', modelId);
    setSelectedModelId(modelId);
  }, []);

  const handleModelInitialized = useCallback((defaultModelId: string) => {
    console.log('[Header] handleModelInitialized called with:', defaultModelId);
    setSelectedModelId(defaultModelId);
  }, []);

  // Get page title with internationalization
  const getPageTitle = () => {
    if (translationsLoading) {
      return 'Loading...'; // 翻译加载中时显示加载文本
    }

    const cleanPath = pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '') || '/';

    if (cleanPath === '/') return t('header.homepageTitle');
    if (cleanPath.includes('/tools/')) {
      const toolName = cleanPath.split('/tools/')[1];
      const toolTitle = t(`tools.${toolName}`);
      return `${t('header.currentTool')}: ${toolTitle || t('header.unknownTool')}`;
    }
    return t('header.appTitle');
  };

  return (
    <header className={cn(
      "h-14 flex items-center justify-between px-6 border-b flex-shrink-0",
      "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
    )}>
      <div>
        <h1 className="text-md font-medium text-neutral-800 dark:text-neutral-200">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <ModelSelector
          selectedModelId={selectedModelId}
          onModelSelect={handleModelSelect}
          onModelInitialized={handleModelInitialized}
        />
        <Link
          href={locale === 'zh-CN' ? '/' : `/${locale}`}
          title={t('common.backToHome')}
          className={cn(
            "p-1.5 rounded-md focus:outline-none focus:ring-2 transition-colors",
            "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
            "hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:ring-neutral-400 dark:focus:ring-neutral-500"
          )}
        >
          <Home size={20} />
        </Link>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t('common.viewOnGitHub')}
          className={cn(
            "p-1.5 rounded-md focus:outline-none focus:ring-2 transition-colors",
            "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
            "hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:ring-neutral-400 dark:focus:ring-neutral-500"
          )}
        >
          <Github size={20} />
        </a>
        <button
          title={t('common.userProfile')}
          className={cn(
            "p-1.5 rounded-md focus:outline-none focus:ring-2 transition-colors",
            "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
            "hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:ring-neutral-400 dark:focus:ring-neutral-500"
          )}
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
