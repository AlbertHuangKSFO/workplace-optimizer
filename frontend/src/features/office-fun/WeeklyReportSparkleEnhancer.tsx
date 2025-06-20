'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, VenetianMask, Zap } from 'lucide-react'; // Zap for sparkle/enhance action
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  locale: ValidLocale;
}

// TODO: Implement the actual UI and logic for Weekly Report Sparkle Enhancer
function WeeklyReportSparkleEnhancer({ locale }: Props): React.JSX.Element {
  const { t, loading } = useTranslations(locale);
  const [reportContent, setReportContent] = useState<string>('');
  const [enhancedReport, setEnhancedReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reportContent.trim()) {
      setError(t('weeklyReportSparkleEnhancer.emptyContentError'));
      setEnhancedReport('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnhancedReport('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: reportContent }],
          toolId: 'weekly-report-sparkle-enhancer',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('weeklyReportSparkleEnhancer.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setEnhancedReport(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for enhanced report:', data);
        setError(t('weeklyReportSparkleEnhancer.formatError'));
      }
    } catch (e) {
      console.error('Failed to fetch enhanced report:', e);
      setError(e instanceof Error ? e.message : t('weeklyReportSparkleEnhancer.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <VenetianMask className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('weeklyReportSparkleEnhancer.subtitle')}</h1>
        <VenetianMask className="w-8 h-8 text-purple-600 dark:text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="reportContent" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('weeklyReportSparkleEnhancer.contentLabel')}
          </label>
          <Textarea
            id="reportContent"
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            placeholder={t('weeklyReportSparkleEnhancer.contentPlaceholder')}
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={5}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('weeklyReportSparkleEnhancer.enhancing')}
            </>
          ) : (
            <><Zap className="mr-2 h-4 w-4" /> {t('weeklyReportSparkleEnhancer.enhanceButton')}
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('weeklyReportSparkleEnhancer.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !enhancedReport && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 dark:text-purple-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('weeklyReportSparkleEnhancer.loadingMessage')}</p>
        </div>
      )}

      {enhancedReport && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center">
              <VenetianMask className="w-5 h-5 mr-2" /> {t('weeklyReportSparkleEnhancer.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{enhancedReport}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WeeklyReportSparkleEnhancer;
