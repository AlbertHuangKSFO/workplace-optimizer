'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, Send, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AwesomeComplimentGeneratorProps {
  locale?: ValidLocale;
}

function AwesomeComplimentGenerator({ locale = 'zh-CN' }: AwesomeComplimentGeneratorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [praiseSubject, setPraiseSubject] = useState<string>('');
  const [compliment, setCompliment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!praiseSubject.trim()) {
      setError(t('awesomeComplimentGenerator.emptyInputError'));
      setCompliment('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCompliment('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: praiseSubject }],
          toolId: 'awesome-compliment-generator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('awesomeComplimentGenerator.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setCompliment(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for compliment:', data);
        setError(t('awesomeComplimentGenerator.unexpectedError'));
      }
    } catch (e) {
      console.error('Failed to fetch compliment:', e);
      setError(e instanceof Error ? e.message : t('awesomeComplimentGenerator.unknownError'));
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
        <Sparkles className="w-8 h-8 text-pink-500 dark:text-pink-400 mr-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('awesomeComplimentGenerator.title')}
        </h1>
        <Sparkles className="w-8 h-8 text-pink-500 dark:text-pink-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="praiseSubject" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('awesomeComplimentGenerator.inputLabel')}
          </label>
          <Textarea
            id="praiseSubject"
            value={praiseSubject}
            onChange={(e) => setPraiseSubject(e.target.value)}
            placeholder={t('awesomeComplimentGenerator.inputPlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100",
              "focus:ring-pink-500 focus:border-pink-500 dark:focus:ring-pink-500 dark:focus:border-pink-500"
            )}
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('awesomeComplimentGenerator.generating')}
            </>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> {t('awesomeComplimentGenerator.generateButton')}
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
              {t('awesomeComplimentGenerator.errorTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !compliment && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 dark:text-pink-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {t('awesomeComplimentGenerator.loadingText')}
          </p>
        </div>
      )}

      {compliment && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-pink-600 dark:text-pink-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> {t('awesomeComplimentGenerator.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{compliment}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AwesomeComplimentGenerator;
