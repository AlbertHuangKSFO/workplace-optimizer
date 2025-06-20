'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { AlertTriangle, Compass, Loader2, Sparkles } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CareerPathForecasterProps {
  locale?: ValidLocale;
}

const experienceLevels = [
  { value: '0' },
  { value: '1-3' },
  { value: '3-5' },
  { value: '5-10' },
  { value: '10+' },
];

function CareerPathForecaster({ locale = 'zh-CN' }: CareerPathForecasterProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [currentRole, setCurrentRole] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [experience, setExperience] = useState<string>(experienceLevels[1].value); // Default to 1-3 years
  const [aspirations, setAspirations] = useState<string>('');
  const [preferences, setPreferences] = useState<string>('');

  const [forecast, setForecast] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentRole.trim() || !skills.trim() || !aspirations.trim()) {
      setError(t('careerPathForecaster.requiredFields'));
      setForecast('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setForecast('');

    const selectedExperience = t(`careerPathForecaster.experienceLevels.${experience}`);

    let userPrompt = t('careerPathForecaster.aiPrompt')
      .replace('{currentRole}', currentRole)
      .replace('{skills}', skills)
      .replace('{experience}', selectedExperience)
      .replace('{aspirations}', aspirations);

    if (preferences.trim()) {
      const preferencesText = `${locale === 'en-US' ? '- Work Preferences: ' : '- 工作偏好：'}${preferences}`;
      userPrompt = userPrompt.replace('{preferences}', preferencesText);
    } else {
      userPrompt = userPrompt.replace('{preferences}', '');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'career-path-forecaster',
          language: locale
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('careerPathForecaster.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.assistantMessage) {
        setForecast(data.assistantMessage);
      } else {
        setError(t('careerPathForecaster.formatError'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('careerPathForecaster.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }, [currentRole, skills, experience, aspirations, preferences, t, locale]);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <Compass className="w-10 h-10 text-sky-500 dark:text-sky-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400">
          {t('careerPathForecaster.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          {t('careerPathForecaster.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col space-y-6 px-4 sm:px-0 py-4 min-h-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentRole" className="block text-sm font-medium mb-1">{t('careerPathForecaster.currentRoleLabel')} <span className="text-red-500">*</span></Label>
            <Textarea
              id="currentRole"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder={t('careerPathForecaster.currentRolePlaceholder')}
              className="min-h-[60px]"
              required
            />
          </div>
          <div>
            <Label htmlFor="skills" className="block text-sm font-medium mb-1">{t('careerPathForecaster.skillsLabel')} <span className="text-red-500">*</span></Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={t('careerPathForecaster.skillsPlaceholder')}
              className="min-h-[80px]"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="experience" className="block text-sm font-medium mb-1">{t('careerPathForecaster.experienceLabel')} <span className="text-red-500">*</span></Label>
                <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger id="experience">
                    <SelectValue placeholder={t('careerPathForecaster.experiencePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                    {experienceLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                        {t(`careerPathForecaster.experienceLevels.${level.value}`)}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="aspirations" className="block text-sm font-medium mb-1">{t('careerPathForecaster.aspirationsLabel')} <span className="text-red-500">*</span></Label>
                <Textarea
                    id="aspirations"
                    value={aspirations}
                    onChange={(e) => setAspirations(e.target.value)}
                    placeholder={t('careerPathForecaster.aspirationsPlaceholder')}
                    className="min-h-[60px] md:min-h-[calc(theme(spacing.10)+theme(spacing.px)*2+theme(spacing.4))]" // Match select height + label-ish
                    required
                />
            </div>
          </div>
          <div>
            <Label htmlFor="preferences" className="block text-sm font-medium mb-1">{t('careerPathForecaster.preferencesLabel')}</Label>
            <Textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder={t('careerPathForecaster.preferencesPlaceholder')}
              className="min-h-[80px]"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full !mt-6 text-base py-3">
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('careerPathForecaster.predicting')}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> {t('careerPathForecaster.predictButton')}</>
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 flex items-start flex-shrink-0">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && !forecast && !error && (
          <div className="text-center py-10 flex flex-col items-center justify-center flex-grow">
            <Loader2 className="h-12 w-12 animate-spin text-sky-500 dark:text-sky-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">{t('careerPathForecaster.loadingMessage')}</p>
          </div>
        )}

        {forecast && !isLoading && (
          <div className="mt-6 flex flex-col flex-grow min-h-0">
            <h3 className="text-xl font-semibold mb-3 text-center text-sky-700 dark:text-sky-300 flex-shrink-0">
              <Compass className="inline-block w-6 h-6 mr-2" /> {t('careerPathForecaster.resultTitle')}
            </h3>
            <div className="relative p-4 rounded-lg bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto min-h-0">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{forecast}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CareerPathForecaster;
