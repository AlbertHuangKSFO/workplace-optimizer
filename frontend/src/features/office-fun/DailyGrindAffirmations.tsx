'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { KanbanSquare, Loader2, RefreshCw } from 'lucide-react'; // RefreshCw for getting a new quote
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DailyGrindAffirmationsProps {
  locale: ValidLocale;
}

function DailyGrindAffirmations({ locale }: DailyGrindAffirmationsProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [affirmation, setAffirmation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAffirmation() {
    setIsLoading(true);
    setError(null);

    // Create prompt based on locale
    const prompt = locale === 'en-US'
      ? 'Give me a daily exclusive quote for office workers, either sarcastic or truly healing! Language: English.'
      : '来一句今日限定的"打工人"专属语录，或毒鸡汤或真治愈都行！';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          toolId: 'daily-grind-affirmations',
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('dailyGrindAffirmations.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAffirmation(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for affirmation:', data);
        setError(t('dailyGrindAffirmations.unexpectedError'));
      }
    } catch (e) {
      console.error('Failed to fetch affirmation:', e);
      setError(e instanceof Error ? e.message : t('dailyGrindAffirmations.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch one on initial load
  useEffect(() => {
    if (!translationsLoading) {
      fetchAffirmation();
    }
  }, [translationsLoading]);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col items-center",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <KanbanSquare className="w-8 h-8 text-lime-600 dark:text-lime-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('dailyGrindAffirmations.title')}
        </h1>
        <KanbanSquare className="w-8 h-8 text-lime-600 dark:text-lime-400 ml-2" />
      </div>

      <p className="text-neutral-700 dark:text-neutral-300 mb-8 text-center max-w-md whitespace-pre-line">
        {t('dailyGrindAffirmations.description')}
      </p>

      <Button
        onClick={fetchAffirmation}
        disabled={isLoading}
        className={cn(
          "w-full max-w-xs text-lg py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 mb-8 text-white",
          "bg-lime-600 hover:bg-lime-700 dark:bg-lime-500 dark:hover:bg-lime-600",
          "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:transform-none"
        )}
      >
        {isLoading && !affirmation ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('dailyGrindAffirmations.loadingInitial')}
          </>
        ) : isLoading && affirmation ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('dailyGrindAffirmations.loadingRefresh')}
          </>
        ) : (
          <><RefreshCw className="mr-2 h-5 w-5" /> {affirmation ? t('dailyGrindAffirmations.buttonRefresh') : t('dailyGrindAffirmations.buttonInitial')}
          </>
        )}
      </Button>

      {error && (
        <Card className={cn(
          "w-full max-w-lg mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">
              {t('dailyGrindAffirmations.errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !affirmation && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center w-full max-w-lg">
          <Loader2 className="h-12 w-12 animate-spin text-lime-500 dark:text-lime-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('dailyGrindAffirmations.loadingText')}
          </p>
        </div>
      )}

      {affirmation && (
        <Card className={cn(
          "w-full max-w-lg flex-grow flex flex-col shadow-inner transition-opacity duration-500 ease-in-out",
          isLoading ? 'opacity-50' : 'opacity-100',
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-lime-700 dark:text-lime-400 flex items-center">
              <KanbanSquare className="w-6 h-6 mr-2" /> {t('dailyGrindAffirmations.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-6 leading-relaxed text-neutral-800 dark:text-neutral-200">
            <div className="text-left space-y-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{affirmation}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DailyGrindAffirmations;
