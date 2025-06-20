'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { AlertCircle, FileText, Loader2, Megaphone } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  locale: ValidLocale;
}

function CrisisCommunicationTemplates({ locale }: Props): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [crisisType, setCrisisType] = useState<string>('product');
  const [severity, setSeverity] = useState<string>('medium');
  const [audience, setAudience] = useState<string>('public');
  const [situation, setSituation] = useState<string>('');
  const [tone, setTone] = useState<string>('apologetic');
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situation.trim()) {
      setError(t('crisisCommunicationTemplates.emptySituationError'));
      setGeneratedTemplate('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedTemplate('');

    const userPrompt = `
${t('crisisCommunicationTemplates.crisisTypeLabel')} ${t(`crisisCommunicationTemplates.crisisTypes.${crisisType}`)}
${t('crisisCommunicationTemplates.severityLabel')} ${t(`crisisCommunicationTemplates.severityLevels.${severity}`)}
${t('crisisCommunicationTemplates.audienceLabel')} ${t(`crisisCommunicationTemplates.audiences.${audience}`)}
${t('crisisCommunicationTemplates.toneLabel')} ${t(`crisisCommunicationTemplates.tones.${tone}`)}

${t('crisisCommunicationTemplates.situationLabel')}
${situation}

Please generate a professional crisis communication template.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'crisis-communication-templates',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('crisisCommunicationTemplates.errorTitle') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedTemplate(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('crisisCommunicationTemplates.errorTitle'));
      }
    } catch (e) {
      console.error('Failed to generate template:', e);
      setError(e instanceof Error ? e.message : t('crisisCommunicationTemplates.errorTitle'));
    }

    setIsLoading(false);
  }

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
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
        <Megaphone className="w-8 h-8 text-red-500 dark:text-red-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('crisisCommunicationTemplates.title')}
        </h1>
        <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="crisisType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('crisisCommunicationTemplates.crisisTypeLabel')}
            </Label>
            <Select value={crisisType} onValueChange={setCrisisType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
              )}>
                <SelectValue placeholder={t('crisisCommunicationTemplates.crisisTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('crisisCommunicationTemplates.crisisTypes', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-red-100 dark:focus:bg-red-700/50",
                      "data-[state=checked]:bg-red-200 dark:data-[state=checked]:bg-red-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="severity" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('crisisCommunicationTemplates.severityLabel')}
            </Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
              )}>
                <SelectValue placeholder={t('crisisCommunicationTemplates.severityPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('crisisCommunicationTemplates.severityLevels', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-red-100 dark:focus:bg-red-700/50",
                      "data-[state=checked]:bg-red-200 dark:data-[state=checked]:bg-red-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="audience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('crisisCommunicationTemplates.audienceLabel')}
            </Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
              )}>
                <SelectValue placeholder={t('crisisCommunicationTemplates.audiencePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('crisisCommunicationTemplates.audiences', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-red-100 dark:focus:bg-red-700/50",
                      "data-[state=checked]:bg-red-200 dark:data-[state=checked]:bg-red-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('crisisCommunicationTemplates.toneLabel')}
            </Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
              )}>
                <SelectValue placeholder={t('crisisCommunicationTemplates.tonePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('crisisCommunicationTemplates.tones', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-red-100 dark:focus:bg-red-700/50",
                      "data-[state=checked]:bg-red-200 dark:data-[state=checked]:bg-red-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="situation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('crisisCommunicationTemplates.situationLabel')}
          </Label>
          <Textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={t('crisisCommunicationTemplates.situationPlaceholder')}
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
            )}
            rows={5}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-red-500 hover:bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('crisisCommunicationTemplates.generating')}</>
          ) : (
            <><FileText className="mr-2 h-4 w-4" /> {t('crisisCommunicationTemplates.generateButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('crisisCommunicationTemplates.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedTemplate && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 dark:text-red-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('crisisCommunicationTemplates.generating')}</p>
        </div>
      )}

      {generatedTemplate && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> {t('crisisCommunicationTemplates.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown>{generatedTemplate}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CrisisCommunicationTemplates;
