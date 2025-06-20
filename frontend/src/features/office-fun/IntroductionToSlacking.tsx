'use client';

import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IntroductionToSlackingProps {
  locale: ValidLocale;
}

function IntroductionToSlacking({ locale }: IntroductionToSlackingProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (translationsLoading) return;

    async function fetchContent() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: 'Please provide comprehensive content for Introduction to Slacking based on the prompt template.'
            }],
            toolId: 'introduction-to-slacking',
            locale: locale,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch content and parse error response.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle the API response structure
        if (data && data.assistantMessage) {
          setContent(data.assistantMessage);
        } else if (data && data.content) {
          setContent(data.content);
        } else if (typeof data === 'string') {
          setContent(data);
        } else {
          console.warn('Unexpected API response structure:', data);
          setContent('No content received or in unexpected format.');
        }

      } catch (e) {
        console.error('Failed to fetch Introduction to Slacking content:', e);
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [locale, translationsLoading]);

  if (translationsLoading) {
    return (
      <div className={cn(
        "p-4 sm:p-6 rounded-lg shadow-xl h-full overflow-y-auto",
        "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
      )}>
        <div className="flex flex-col items-center justify-center h-4/5 py-10">
          <Loader2 className="h-12 w-12 animate-spin text-sky-500 dark:text-sky-400 mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full overflow-y-auto",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-sky-600 dark:text-sky-400 text-center">
        {t('introductionToSlacking.title')}
      </h1>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-4/5 py-10">
          <Loader2 className="h-12 w-12 animate-spin text-sky-500 dark:text-sky-400 mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('introductionToSlacking.loading')}
          </p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-4/5 py-10 text-center px-4">
          <p className={cn(
            "p-4 rounded-md mb-2",
            "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50",
            "text-red-700 dark:text-red-400"
          )}>
            {t('introductionToSlacking.errorTitle')}：{error}
          </p>
          <p className="text-neutral-500 dark:text-neutral-500 mt-2 text-sm">
            {t('introductionToSlacking.errorHint')}
          </p>
        </div>
      )}

      {!isLoading && !error && content && (
        <article className={cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words",
          "text-neutral-800 dark:text-neutral-200"
        )}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      )}

      {!isLoading && !error && !content && (
        <div className="flex flex-col items-center justify-center h-4/5 py-10">
          <p className="text-neutral-600 dark:text-neutral-400">
            {t('introductionToSlacking.emptyContent')}
          </p>
        </div>
      )}
    </div>
  );
}

export default IntroductionToSlacking;
