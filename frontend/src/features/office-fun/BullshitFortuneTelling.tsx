'use client';

import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BullshitFortunetellingProps {
  locale?: ValidLocale;
}

function BullshitFortuneTelling({ locale = 'zh-CN' }: BullshitFortunetellingProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (translationsLoading) return;

    async function fetchFortune() {
      setIsLoading(true);
      setError(null);

      // Create prompt based on locale
      const prompt = locale === 'en-US'
        ? 'How is today\'s fortune (nonsense version)? Please tell me in a serious but completely nonsensical way. Language: English.'
        : '今日运势如何（胡说版）？请用一本正经胡说八道的方式告诉我。';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            toolId: 'bullshit-fortune-telling',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: t('bullshitFortuneTelling.apiError') }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.assistantMessage) {
          setContent(data.assistantMessage);
        } else {
          console.warn('Unexpected API response structure for fortune:', data);
          setContent(t('bullshitFortuneTelling.fallbackContent'));
        }

      } catch (e) {
        console.error('Failed to fetch Bullshit Fortune Telling content:', e);
        setError(e instanceof Error ? e.message : t('bullshitFortuneTelling.unknownError'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchFortune();
  }, [translationsLoading, locale, t]);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full overflow-y-auto",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6">
        <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mr-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 text-center">
          {t('bullshitFortuneTelling.title')}
        </h1>
        <Star className="w-8 h-8 text-yellow-500 dark:text-yellow-400 ml-3" />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-4/5">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-600 dark:text-yellow-500 mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('bullshitFortuneTelling.loadingText')}
          </p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-4/5 text-center px-4">
          <p className={cn(
            "p-4 rounded-md mb-2",
            "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50",
            "text-red-700 dark:text-red-400"
          )}>
            {t('bullshitFortuneTelling.errorPrefix')}{error}
          </p>
          <p className="text-neutral-500 dark:text-neutral-500 mt-2 text-sm">
            {t('bullshitFortuneTelling.errorSuffix')}
          </p>
        </div>
      )}

      {!isLoading && !error && content && (
        <article className={cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words p-4 sm:p-6 rounded-md shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50",
          "text-neutral-800 dark:text-neutral-200"
        )}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}
       {!isLoading && !error && !content && (
        <div className="flex flex-col items-center justify-center h-4/5">
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('bullshitFortuneTelling.noContentText')}
          </p>
        </div>
      )}
    </div>
  );
}

export default BullshitFortuneTelling;
