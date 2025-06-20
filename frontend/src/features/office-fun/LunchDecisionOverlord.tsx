'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, Utensils, Zap } from 'lucide-react'; // Zap for the decision action
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LunchDecisionOverlordProps {
  locale: ValidLocale;
}

function LunchDecisionOverlord({ locale }: LunchDecisionOverlordProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [lunchSuggestion, setLunchSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDecideLunch() {
    if (translationsLoading) return;

    setIsLoading(true);
    setError(null);
    setLunchSuggestion('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: t('lunchDecisionOverlord.userMessage') }],
          toolId: 'lunch-decision-overlord',
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('lunchDecisionOverlord.errorFetch') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setLunchSuggestion(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for lunch suggestion:', data);
        setError(t('lunchDecisionOverlord.errorUnexpected'));
      }
    } catch (e) {
      console.error('Failed to fetch lunch suggestion:', e);
      setError(e instanceof Error ? e.message : t('lunchDecisionOverlord.errorUnknown'));
    } finally {
      setIsLoading(false);
    }
  }

  if (translationsLoading) {
    return (
      <div className={cn(
        "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col items-center",
        "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
      )}>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col items-center",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100",
      "max-w-4xl mx-auto"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Utensils className="w-10 h-10 text-amber-500 dark:text-amber-400 mr-3" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('lunchDecisionOverlord.title')}
        </h1>
        <Utensils className="w-10 h-10 text-amber-500 dark:text-amber-400 ml-3" />
      </div>

      <p className="text-neutral-700 dark:text-neutral-300 mb-8 text-center max-w-2xl">
        {t('lunchDecisionOverlord.description')}
      </p>

      <Button
        onClick={handleDecideLunch}
        disabled={isLoading}
        className={cn(
          "w-full max-w-sm text-lg py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 mb-8",
          "bg-amber-500 hover:bg-amber-600 text-white dark:text-neutral-900",
          "dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-neutral-900",
          "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400 disabled:transform-none"
        )}
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('lunchDecisionOverlord.decidingButton')}
          </>
        ) : (
          <><Zap className="mr-2 h-5 w-5" /> {t('lunchDecisionOverlord.decideButton')}
          </>
        )}
      </Button>

      {error && (
        <Card className={cn(
          "w-full max-w-2xl mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">
              {t('lunchDecisionOverlord.errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !lunchSuggestion && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 dark:text-amber-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('lunchDecisionOverlord.loading')}
          </p>
        </div>
      )}

      {lunchSuggestion && !isLoading && (
        <Card className={cn(
          "w-full max-w-3xl flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center">
              <Utensils className="w-6 h-6 mr-2" /> {t('lunchDecisionOverlord.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lunchSuggestion}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LunchDecisionOverlord;
