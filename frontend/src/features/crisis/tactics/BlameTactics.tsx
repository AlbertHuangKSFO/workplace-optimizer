'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2, Shield, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  locale: ValidLocale;
}

function BlameTactics({ locale }: Props): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [situation, setSituation] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('medium');
  const [impact, setImpact] = useState<string>('team');
  const [role, setRole] = useState<string>('senior');
  const [generatedTactics, setGeneratedTactics] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situation.trim()) {
      setError(t('blameTactics.emptySituationError'));
      setGeneratedTactics('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedTactics('');

    const userPrompt = `
${t('blameTactics.situationLabel')} ${situation}
${t('blameTactics.urgencyLabel')} ${t(`blameTactics.urgencyLevels.${urgency}`)}
${t('blameTactics.impactLabel')} ${t(`blameTactics.impactLevels.${impact}`)}
${t('blameTactics.roleLabel')} ${t(`blameTactics.roles.${role}`)}

Please provide professional workplace blame avoidance strategies and tactics for this situation.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'blame-tactics',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('blameTactics.errorTitle') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedTactics(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('blameTactics.errorTitle'));
      }
    } catch (e) {
      console.error('Failed to generate tactics:', e);
      setError(e instanceof Error ? e.message : t('blameTactics.errorTitle'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Shield className="w-8 h-8 text-orange-500 dark:text-orange-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('blameTactics.title')}
        </h1>
        <AlertTriangle className="w-8 h-8 text-orange-500 dark:text-orange-400 ml-2" />
      </div>

      <div className={cn(
        "mb-4 p-3 rounded-lg",
        "bg-amber-50 border border-amber-300 dark:bg-amber-900/40 dark:border-amber-500/50"
      )}>
        <p className={cn("text-sm", "text-amber-700 dark:text-amber-200")}>
          ⚠️ <strong>{locale === 'zh-CN' ? '使用提醒：' : 'Usage Note:'}</strong>{' '}
          {t('blameTactics.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="situation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('blameTactics.situationLabel')}
          </Label>
          <Textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={t('blameTactics.situationPlaceholder')}
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-500 dark:focus:border-orange-500"
            )}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="urgency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('blameTactics.urgencyLabel')}
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-500 dark:focus:border-orange-500"
              )}>
                <SelectValue placeholder={t('blameTactics.urgencyPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('blameTactics.urgencyLevels', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-orange-100 dark:focus:bg-orange-700/50",
                      "data-[state=checked]:bg-orange-200 dark:data-[state=checked]:bg-orange-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="impact" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('blameTactics.impactLabel')}
            </Label>
            <Select value={impact} onValueChange={setImpact}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-500 dark:focus:border-orange-500"
              )}>
                <SelectValue placeholder={t('blameTactics.impactPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('blameTactics.impactLevels', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-orange-100 dark:focus:bg-orange-700/50",
                      "data-[state=checked]:bg-orange-200 dark:data-[state=checked]:bg-orange-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('blameTactics.roleLabel')}
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-orange-500 focus:border-orange-500 dark:focus:ring-orange-500 dark:focus:border-orange-500"
              )}>
                <SelectValue placeholder={t('blameTactics.rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('blameTactics.roles', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-orange-100 dark:focus:bg-orange-700/50",
                      "data-[state=checked]:bg-orange-200 dark:data-[state=checked]:bg-orange-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('blameTactics.analyzing')}</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('blameTactics.getAdviceButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('blameTactics.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedTactics && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 dark:text-orange-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('blameTactics.analyzing')}</p>
        </div>
      )}

      {generatedTactics && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center">
              <Shield className="w-5 h-5 mr-2" /> {t('blameTactics.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedTactics}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BlameTactics;
