'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Calendar, Loader2, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DailySlackingAlmanacProps {
  locale: ValidLocale;
}

function DailySlackingAlmanac({ locale }: DailySlackingAlmanacProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [almanacContent, setAlmanacContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAlmanac() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: t('dailySlackingAlmanac.apiRequest.prompt') }],
          toolId: 'daily-slacking-almanac',
          language: locale === 'zh-CN' ? 'zh' : 'en'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('dailySlackingAlmanac.errors.defaultError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAlmanacContent(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for almanac:', data);
        setError(t('dailySlackingAlmanac.errors.formatError'));
      }
    } catch (e) {
      console.error('Failed to fetch almanac:', e);
      setError(e instanceof Error ? e.message : t('dailySlackingAlmanac.errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  // 自动加载今日黄历
  useEffect(() => {
    fetchAlmanac();
  }, []);

  // 获取今日日期
  const today = new Date();
  const dateString = today.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // 如果翻译还在加载中，显示加载状态
  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Calendar className="w-8 h-8 text-red-600 dark:text-red-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('dailySlackingAlmanac.title')}</h1>
        <Calendar className="w-8 h-8 text-red-600 dark:text-red-400 ml-2" />
      </div>

      <div className="text-center mb-6">
        <div className={cn(
          "rounded-lg p-4 border",
          "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 mb-2">{t('dailySlackingAlmanac.todayDate')}</h2>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg">{dateString}</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <Button
          onClick={fetchAlmanac}
          disabled={isLoading}
          className={cn(
            "text-white",
            "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dailySlackingAlmanac.refreshing')}
            </>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" /> {t('dailySlackingAlmanac.refreshButton')}
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('dailySlackingAlmanac.errors.loadFailed')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !almanacContent && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 dark:text-red-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('dailySlackingAlmanac.loadingMessage')}</p>
        </div>
      )}

      {almanacContent && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner transition-opacity duration-500 ease-in-out",
          isLoading ? 'opacity-50' : 'opacity-100',
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center">
              <Calendar className="w-6 h-6 mr-2" /> {t('dailySlackingAlmanac.todayGuidance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-6 leading-relaxed text-neutral-800 dark:text-neutral-200">
            <div className="text-left space-y-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{almanacContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DailySlackingAlmanac;
