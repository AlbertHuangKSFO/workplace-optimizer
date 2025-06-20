'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { ShieldAlert, Terminal } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const TOOL_ID = 'anti-pua-assistant';

interface Props {
  locale: ValidLocale;
}

function AntiPuaAssistant({ locale }: Props): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [puaScenario, setPuaScenario] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!puaScenario.trim()) {
      setError(t('antiPuaAssistant.emptyInputError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssistantResponse('');
    setModelUsed(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: TOOL_ID,
          messages: [{ role: 'user', content: puaScenario }],
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `请求失败，状态码：${response.status}`,
        );
      }

      const data = await response.json();
      setAssistantResponse(data.assistantMessage);
      setModelUsed(data.modelUsed || null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('发生未知错误');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex items-center justify-center py-20">
          <ShieldAlert className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("container mx-auto p-4 md:p-6 lg:p-8", "bg-transparent")}>
      <Card className={cn("max-w-2xl mx-auto", "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800")}>
        <CardHeader>
          <CardTitle className={cn("text-2xl font-bold flex items-center", "text-neutral-900 dark:text-neutral-100")}>
            <ShieldAlert className="w-6 h-6 mr-2 text-red-600 dark:text-red-400" />
            {t('antiPuaAssistant.title')}
          </CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            {t('antiPuaAssistant.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-neutral-900 dark:text-neutral-100">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="puaScenario" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('antiPuaAssistant.scenarioLabel')}
                </Label>
                <Textarea
                  id="puaScenario"
                  value={puaScenario}
                  onChange={(e) => setPuaScenario(e.target.value)}
                  placeholder={t('antiPuaAssistant.scenarioPlaceholder')}
                  rows={6}
                  className={cn(
                    "w-full",
                    "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                    "text-neutral-900 dark:text-neutral-100",
                    "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500",
                    "disabled:bg-neutral-200 dark:disabled:bg-neutral-700/50 disabled:text-neutral-500 dark:disabled:text-neutral-400"
                  )}
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className={cn(
                  "w-full sm:w-auto text-white",
                  "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
                  "disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:text-neutral-500 dark:disabled:text-neutral-400"
                )}
                disabled={isLoading}
              >
                {isLoading ? t('antiPuaAssistant.analyzing') : t('antiPuaAssistant.analyzeButton')}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-6 bg-red-50 dark:bg-red-900/30 border-red-500/50 dark:border-red-700/50 text-red-700 dark:text-red-400">
              <Terminal className="h-4 w-4 text-red-700 dark:text-red-400" />
              <AlertTitle>{t('antiPuaAssistant.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {assistantResponse && (
            <div className="mt-6 space-y-4">
              <Separator className="bg-neutral-200 dark:bg-neutral-800" />
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                {t('antiPuaAssistant.resultTitle')}
              </h3>
              <div className={cn(
                "prose dark:prose-invert max-w-none p-4 rounded-md",
                "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100"
              )}>
                <ReactMarkdown>{assistantResponse}</ReactMarkdown>
              </div>
              {modelUsed && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {locale === 'zh-CN' ? `模型由 ${modelUsed} 提供支持` : `Powered by ${modelUsed}`}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-neutral-500 dark:text-neutral-400">
          <p>{t('antiPuaAssistant.footerNote')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AntiPuaAssistant;
