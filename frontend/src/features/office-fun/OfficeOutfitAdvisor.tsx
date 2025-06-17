'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, ShieldCheck, Wand2 } from 'lucide-react'; // Wand2 for generating magic advice
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface OfficeOutfitAdvisorProps {
  locale: ValidLocale;
}

function OfficeOutfitAdvisor({ locale }: OfficeOutfitAdvisorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [weather, setWeather] = useState<string>('');
  const [meetingContext, setMeetingContext] = useState<string>('');
  const [chillLevel, setChillLevel] = useState<string>('3');
  const [outfitAdvice, setOutfitAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 精致指数选项
  const chillLevels = useMemo(() => [
    { value: '1' },
    { value: '2' },
    { value: '3' },
    { value: '4' },
    { value: '5' },
  ], []);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setOutfitAdvice('');

    const chillLevelLabel = t(`officeOutfitAdvisor.chillLevels.${chillLevel}`);

    const userPrompt = locale === 'zh-CN' ?
      `请根据以下情况，为我推荐今日职场穿搭：
${weather.trim() ? `- 天气：${weather}` : ''}
${meetingContext.trim() ? `- 会议/场合情况：${meetingContext}` : ''}
- 我今天的"职场精致/躺平指数"是：${chillLevelLabel}

请给出具体、实用且风趣的穿搭建议。` :
      `Please recommend today's office outfit based on the following situation:
${weather.trim() ? `- Weather: ${weather}` : ''}
${meetingContext.trim() ? `- Meeting/Event situation: ${meetingContext}` : ''}
- My today's "Professional/Chill Index" is: ${chillLevelLabel}

Please provide specific, practical and witty outfit suggestions.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'office-outfit-advisor',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('officeOutfitAdvisor.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setOutfitAdvice(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for outfit advice:', data);
        setError(t('officeOutfitAdvisor.formatError'));
      }
    } catch (e) {
      console.error('Failed to fetch outfit advice:', e);
      setError(e instanceof Error ? e.message : t('officeOutfitAdvisor.unknownError'));
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
        <ShieldCheck className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('officeOutfitAdvisor.title')}</h1>
        <ShieldCheck className="w-8 h-8 text-cyan-600 dark:text-cyan-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="weather" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('officeOutfitAdvisor.weatherLabel')}</Label>
          <Input
            type="text"
            id="weather"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder={t('officeOutfitAdvisor.weatherPlaceholder')}
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
        <div>
          <Label htmlFor="meetingContext" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('officeOutfitAdvisor.meetingLabel')}</Label>
          <Input
            type="text"
            id="meetingContext"
            value={meetingContext}
            onChange={(e) => setMeetingContext(e.target.value)}
            placeholder={t('officeOutfitAdvisor.meetingPlaceholder')}
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
        <div>
          <Label htmlFor="chillLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('officeOutfitAdvisor.chillLevelLabel')}</Label>
          <Select value={chillLevel} onValueChange={setChillLevel}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder={t('officeOutfitAdvisor.chillLevelPlaceholder')} />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {chillLevels.map(level => (
                <SelectItem
                  key={level.value}
                  value={level.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {t(`officeOutfitAdvisor.chillLevels.${level.value}`)}
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
            "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('officeOutfitAdvisor.generating')}
            </>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> {t('officeOutfitAdvisor.getAdviceButton')}
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
            <CardTitle className="text-red-700 dark:text-red-400">{t('officeOutfitAdvisor.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !outfitAdvice && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 dark:text-cyan-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('officeOutfitAdvisor.loadingMessage')}</p>
        </div>
      )}

      {outfitAdvice && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-cyan-700 dark:text-cyan-400 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" /> {t('officeOutfitAdvisor.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{outfitAdvice}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OfficeOutfitAdvisor;
