'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { BarChart3, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DataBeautifierProps {
  locale: ValidLocale;
}

function DataBeautifier({ locale }: DataBeautifierProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [reportType, setReportType] = useState<string>('weekly');
  const [audienceType, setAudienceType] = useState<string>('leadership');
  const [beautifyStyle, setBeautifyStyle] = useState<string>('professional');
  const [rawData, setRawData] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [beautifiedData, setBeautifiedData] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 汇报类型选项
  const reportTypes = useMemo(() => [
    { value: 'weekly', emoji: '📅' },
    { value: 'monthly', emoji: '📊' },
    { value: 'quarterly', emoji: '📈' },
    { value: 'project', emoji: '🎯' },
    { value: 'performance', emoji: '⭐' },
    { value: 'business', emoji: '💼' },
  ], []);

  // 目标受众选项
  const audienceTypes = useMemo(() => [
    { value: 'leadership', emoji: '👔' },
    { value: 'peers', emoji: '🤝' },
    { value: 'team', emoji: '👥' },
    { value: 'client', emoji: '🤝' },
    { value: 'stakeholders', emoji: '🎯' },
  ], []);

  // 美化风格选项
  const beautifyStyles = useMemo(() => [
    { value: 'professional', emoji: '🎩' },
    { value: 'storytelling', emoji: '📖' },
    { value: 'achievement', emoji: '🏆' },
    { value: 'analytical', emoji: '🔍' },
    { value: 'visual', emoji: '📊' },
    { value: 'inspiring', emoji: '🚀' },
  ], []);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rawData.trim()) {
      setError(t('dataBeautifier.requiredField'));
      setBeautifiedData('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setBeautifiedData('');

    const reportTypeLabel = t(`dataBeautifier.reportTypes.${reportType}.label`);
    const reportTypeDesc = t(`dataBeautifier.reportTypes.${reportType}.description`);
    const audienceLabel = t(`dataBeautifier.audienceTypes.${audienceType}.label`);
    const audienceDesc = t(`dataBeautifier.audienceTypes.${audienceType}.description`);
    const styleLabel = t(`dataBeautifier.beautifyStyles.${beautifyStyle}.label`);
    const styleDesc = t(`dataBeautifier.beautifyStyles.${beautifyStyle}.description`);

    const userPrompt = locale === 'zh-CN' ? `
汇报类型：${reportTypeLabel} - ${reportTypeDesc}
目标受众：${audienceLabel} - ${audienceDesc}
美化风格：${styleLabel} - ${styleDesc}

原始数据：
${rawData}

${context.trim() ? `背景信息：${context}` : ''}
${goals.trim() ? `汇报目标：${goals}` : ''}

请将这些枯燥的数据转化为生动、有说服力、易于理解的文字描述，突出亮点和价值。
` : `
Report Type: ${reportTypeLabel} - ${reportTypeDesc}
Target Audience: ${audienceLabel} - ${audienceDesc}
Beautify Style: ${styleLabel} - ${styleDesc}

Raw Data:
${rawData}

${context.trim() ? `Background Information: ${context}` : ''}
${goals.trim() ? `Report Goals: ${goals}` : ''}

Please transform this boring data into vivid, persuasive, and easy-to-understand text descriptions, highlighting key points and value.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'data-beautifier',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('dataBeautifier.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setBeautifiedData(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('dataBeautifier.formatError'));
      }
    } catch (e) {
      console.error('Failed to beautify data:', e);
      setError(e instanceof Error ? e.message : t('dataBeautifier.unknownError'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <BarChart3 className="w-8 h-8 text-green-500 dark:text-green-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('dataBeautifier.title')}</h1>
        <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="reportType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('dataBeautifier.reportTypeLabel')}
            </Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              )}>
                <SelectValue placeholder={t('dataBeautifier.reportTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {reportTypes.map(type => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-green-100 dark:focus:bg-green-700/50",
                      "data-[state=checked]:bg-green-200 dark:data-[state=checked]:bg-green-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{type.emoji} {t(`dataBeautifier.reportTypes.${type.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`dataBeautifier.reportTypes.${type.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="audienceType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('dataBeautifier.audienceTypeLabel')}
            </Label>
            <Select value={audienceType} onValueChange={setAudienceType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              )}>
                <SelectValue placeholder={t('dataBeautifier.audienceTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {audienceTypes.map(audience => (
                  <SelectItem
                    key={audience.value}
                    value={audience.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-green-100 dark:focus:bg-green-700/50",
                      "data-[state=checked]:bg-green-200 dark:data-[state=checked]:bg-green-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{audience.emoji} {t(`dataBeautifier.audienceTypes.${audience.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`dataBeautifier.audienceTypes.${audience.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="beautifyStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('dataBeautifier.beautifyStyleLabel')}
            </Label>
            <Select value={beautifyStyle} onValueChange={setBeautifyStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
              )}>
                <SelectValue placeholder={t('dataBeautifier.beautifyStylePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {beautifyStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-green-100 dark:focus:bg-green-700/50",
                      "data-[state=checked]:bg-green-200 dark:data-[state=checked]:bg-green-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {t(`dataBeautifier.beautifyStyles.${style.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`dataBeautifier.beautifyStyles.${style.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="rawData" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('dataBeautifier.rawDataLabel')}
          </Label>
          <Textarea
            id="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder={t('dataBeautifier.rawDataPlaceholder')}
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            )}
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="context" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('dataBeautifier.contextLabel')}
          </Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t('dataBeautifier.contextPlaceholder')}
            className={cn(
              "w-full min-h-[60px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            )}
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="goals" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('dataBeautifier.goalsLabel')}
          </Label>
          <Textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={t('dataBeautifier.goalsPlaceholder')}
            className={cn(
              "w-full min-h-[60px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            )}
            rows={2}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('dataBeautifier.beautifying')}</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('dataBeautifier.beautifyButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('dataBeautifier.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !beautifiedData && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 dark:text-green-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('dataBeautifier.loadingMessage')}</p>
        </div>
      )}

      {beautifiedData && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-green-600 dark:text-green-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> {t('dataBeautifier.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{beautifiedData}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DataBeautifier;
