'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { ChefHat, Loader2, Wand2 } from 'lucide-react'; // Wand2 for generating magic excuses
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface UniversalExcuseGeneratorProps {
  locale: ValidLocale;
}

function UniversalExcuseGenerator({ locale }: UniversalExcuseGeneratorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [excuseScenario, setExcuseScenario] = useState<string>('');
  const [generatedExcuse, setGeneratedExcuse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!excuseScenario.trim()) {
      setError(t('universalExcuseGenerator.emptyInputError'));
      setGeneratedExcuse('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedExcuse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: excuseScenario }],
          toolId: 'universal-excuse-generator',
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('universalExcuseGenerator.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedExcuse(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for excuse:', data);
        setError(t('universalExcuseGenerator.unexpectedError'));
      }
    } catch (e) {
      console.error('Failed to fetch excuse:', e);
      setError(e instanceof Error ? e.message : t('universalExcuseGenerator.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

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
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <ChefHat className="w-8 h-8 text-orange-500 dark:text-orange-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('universalExcuseGenerator.title')}
        </h1>
        <ChefHat className="w-8 h-8 text-orange-500 dark:text-orange-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="excuseScenario" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('universalExcuseGenerator.inputLabel')}
          </label>
          <Textarea
            id="excuseScenario"
            value={excuseScenario}
            onChange={(e) => setExcuseScenario(e.target.value)}
            placeholder={t('universalExcuseGenerator.inputPlaceholder')}
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={4}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('universalExcuseGenerator.generating')}
            </>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> {t('universalExcuseGenerator.generateButton')}
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
            <CardTitle className="text-red-700 dark:text-red-400">
              {t('universalExcuseGenerator.errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedExcuse && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 dark:text-orange-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('universalExcuseGenerator.loadingText')}
          </p>
        </div>
      )}

      {generatedExcuse && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center">
              <ChefHat className="w-5 h-5 mr-2" /> {t('universalExcuseGenerator.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedExcuse}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UniversalExcuseGenerator;
