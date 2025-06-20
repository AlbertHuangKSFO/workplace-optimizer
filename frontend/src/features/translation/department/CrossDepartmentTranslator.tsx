'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { ArrowRight, Building2, Loader2, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CrossDepartmentTranslatorProps {
  locale: ValidLocale;
}

function CrossDepartmentTranslator({ locale }: CrossDepartmentTranslatorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [originalText, setOriginalText] = useState<string>('');
  const [sourceDepartment, setSourceDepartment] = useState<string>('tech');
  const [targetDepartment, setTargetDepartment] = useState<string>('product');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const departments = useMemo(() => [
    { value: 'tech', label: t('crossDepartmentTranslator.departments.tech'), emoji: '💻' },
    { value: 'product', label: t('crossDepartmentTranslator.departments.product'), emoji: '📱' },
    { value: 'design', label: t('crossDepartmentTranslator.departments.design'), emoji: '🎨' },
    { value: 'marketing', label: t('crossDepartmentTranslator.departments.marketing'), emoji: '📢' },
    { value: 'sales', label: t('crossDepartmentTranslator.departments.sales'), emoji: '💰' },
    { value: 'operations', label: t('crossDepartmentTranslator.departments.operations'), emoji: '⚙️' },
    { value: 'hr', label: t('crossDepartmentTranslator.departments.hr'), emoji: '👥' },
    { value: 'finance', label: t('crossDepartmentTranslator.departments.finance'), emoji: '💼' },
    { value: 'legal', label: t('crossDepartmentTranslator.departments.legal'), emoji: '⚖️' },
    { value: 'management', label: t('crossDepartmentTranslator.departments.management'), emoji: '👔' },
  ], [t, translationsLoading]);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!originalText.trim()) {
      setError(t('crossDepartmentTranslator.emptyInputError'));
      setTranslatedText('');
      return;
    }

    if (sourceDepartment === targetDepartment) {
      setError(t('crossDepartmentTranslator.sameDepartmentError'));
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    const sourceDept = departments.find(d => d.value === sourceDepartment);
    const targetDept = departments.find(d => d.value === targetDepartment);

    const userPrompt = locale === 'zh-CN'
      ? `请帮我将以下来自${sourceDept?.label}的信息翻译成${targetDept?.label}能够理解和认同的表达方式：\n\n${originalText}`
      : `Please help me translate the following message from ${sourceDept?.label} into language that ${targetDept?.label} can understand and relate to:\n\n${originalText}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'cross-department-translator',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('crossDepartmentTranslator.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setTranslatedText(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('crossDepartmentTranslator.formatError'));
      }
    } catch (e) {
      console.error('Failed to translate:', e);
      setError(e instanceof Error ? e.message : t('crossDepartmentTranslator.unknownError'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('crossDepartmentTranslator.title')}</h1>
        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <Label htmlFor="sourceDepartment" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('crossDepartmentTranslator.sourceDepartmentLabel')}
            </Label>
            <Select value={sourceDepartment} onValueChange={setSourceDepartment}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
              )}>
                <SelectValue placeholder={t('crossDepartmentTranslator.sourceDepartmentPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {departments.map(dept => (
                  <SelectItem
                    key={dept.value}
                    value={dept.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                      "focus:bg-sky-100 dark:focus:bg-sky-700"
                    )}
                  >
                    {dept.emoji} {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-center items-center h-full pb-2 md:pb-0 md:h-auto md:self-end">
            <ArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <Label htmlFor="targetDepartment" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('crossDepartmentTranslator.targetDepartmentLabel')}
            </Label>
            <Select value={targetDepartment} onValueChange={setTargetDepartment}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
              )}>
                <SelectValue placeholder={t('crossDepartmentTranslator.targetDepartmentPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {departments.map(dept => (
                  <SelectItem
                    key={dept.value}
                    value={dept.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                      "focus:bg-sky-100 dark:focus:bg-sky-700"
                    )}
                  >
                    {dept.emoji} {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="originalText" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('crossDepartmentTranslator.inputLabel')}
          </Label>
          <Textarea
            id="originalText"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={t('crossDepartmentTranslator.inputPlaceholder')}
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('crossDepartmentTranslator.translating')}</>
          ) : (
            <><Users className="mr-2 h-4 w-4" /> {t('crossDepartmentTranslator.translateButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('crossDepartmentTranslator.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !translatedText && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('crossDepartmentTranslator.translating')}</p>
        </div>
      )}

      {translatedText && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center">
              <ArrowRight className="w-5 h-5 mr-2" /> {t('crossDepartmentTranslator.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedText}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CrossDepartmentTranslator;
