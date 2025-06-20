'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquareText, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SpeechOptimizerProps {
  locale: ValidLocale;
}

function SpeechOptimizer({ locale }: SpeechOptimizerProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [originalText, setOriginalText] = useState<string>('');
  const [optimizationGoal, setOptimizationGoal] = useState<string>('professional');
  const [optimizedText, setOptimizedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const optimizationGoals = React.useMemo(() => [
    { value: 'polite', label: t('speechOptimizer.goals.polite') },
    { value: 'professional', label: t('speechOptimizer.goals.professional') },
    { value: 'persuasive', label: t('speechOptimizer.goals.persuasive') },
    { value: 'diplomatic', label: t('speechOptimizer.goals.diplomatic') },
    { value: 'assertive', label: t('speechOptimizer.goals.assertive') },
    { value: 'friendly', label: t('speechOptimizer.goals.friendly') },
    { value: 'concise', label: t('speechOptimizer.goals.concise') },
    { value: 'emotional', label: t('speechOptimizer.goals.emotional') },
  ], [t, translationsLoading]);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!originalText.trim()) {
      setError(t('speechOptimizer.emptyInputError'));
      setOptimizedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptimizedText('');

    const selectedGoal = optimizationGoals.find(g => g.value === optimizationGoal);
    const userPrompt = locale === 'zh-CN'
      ? `请帮我优化以下话术，目标是让它${selectedGoal?.label}：\n\n${originalText}`
      : `Please optimize the following speech to make it ${selectedGoal?.label}:\n\n${originalText}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'speech-optimizer',
        }),
      });

      if (!response.ok) {
        const defaultErrorMessage = locale === 'zh-CN'
          ? '话术优化失败，可能是AI的修辞学课程还没上完。'
          : 'Speech optimization failed, the AI rhetoric course might not be completed yet.';
        const errorData = await response.json().catch(() => ({ message: defaultErrorMessage }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setOptimizedText(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for speech optimization:', data);
        const unexpectedResponseError = locale === 'zh-CN'
          ? 'AI返回的优化结果有点奇怪，我暂时理解不了...🤔'
          : 'The AI optimization result seems strange, I can\'t understand it for now...🤔';
        setError(unexpectedResponseError);
      }
    } catch (e) {
      console.error('Failed to optimize speech:', e);
      const unknownError = locale === 'zh-CN'
        ? '优化话术时发生未知错误，我的语言中枢短路了！💫'
        : 'An unknown error occurred during speech optimization, my language center short-circuited!💫';
      setError(e instanceof Error ? e.message : unknownError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <MessageSquareText className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('speechOptimizer.title')}</h1>
        <MessageSquareText className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="originalText" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('speechOptimizer.inputLabel')}
          </Label>
          <Textarea
            id="originalText"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={t('speechOptimizer.inputPlaceholder')}
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="optimizationGoal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('speechOptimizer.goalLabel')}
          </Label>
          <Select value={optimizationGoal} onValueChange={setOptimizationGoal}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder={t('speechOptimizer.goalPlaceholder')} />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {optimizationGoals.map(goal => (
                <SelectItem
                  key={goal.value}
                  value={goal.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('speechOptimizer.optimizingButton')}
            </>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> {t('speechOptimizer.optimizeButton')}
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
            <CardTitle className="text-red-700 dark:text-red-400">{t('speechOptimizer.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !optimizedText && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('speechOptimizer.loadingText')}</p>
        </div>
      )}

      {optimizedText && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center">
              <Wand2 className="w-5 h-5 mr-2" /> {t('speechOptimizer.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedText}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SpeechOptimizer;
