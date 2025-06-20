'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Briefcase, Loader2, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  locale: ValidLocale;
}

function CareerLevelingSystem({ locale }: Props): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [currentRole, setCurrentRole] = useState<string>('');
  const [experience, setExperience] = useState<string>('junior');
  const [industry, setIndustry] = useState<string>('tech');
  const [skills, setSkills] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentRole.trim()) {
      setError(t('careerLevelingSystem.emptyRoleError'));
      setGeneratedReport('');
      return;
    }
    if (!skills.trim()) {
      setError(t('careerLevelingSystem.emptySkillsError'));
      setGeneratedReport('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedReport('');

    const userPrompt = `
${t('careerLevelingSystem.currentRoleLabel')} ${currentRole}
${t('careerLevelingSystem.experienceLabel')} ${t(`careerLevelingSystem.experienceLevels.${experience}`)}
${t('careerLevelingSystem.industryLabel')} ${t(`careerLevelingSystem.industries.${industry}`)}

${t('careerLevelingSystem.skillsLabel')}
${skills}

${goal.trim() ? `${t('careerLevelingSystem.goalLabel')}\n${goal}` : ''}
${challenges.trim() ? `${t('careerLevelingSystem.challengesLabel')}\n${challenges}` : ''}

Please provide a comprehensive career leveling analysis and development recommendations.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'career-leveling-system',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('careerLevelingSystem.errorTitle') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedReport(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('careerLevelingSystem.errorTitle'));
      }
    } catch (e) {
      console.error('Failed to generate career report:', e);
      setError(e instanceof Error ? e.message : t('careerLevelingSystem.errorTitle'));
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
    <Card className={cn(
      "w-full max-w-4xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <TrendingUp className="w-10 h-10 text-blue-500 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
          {t('careerLevelingSystem.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          {t('careerLevelingSystem.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-grow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentRole" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('careerLevelingSystem.currentRoleLabel')}
              </Label>
              <Textarea
                id="currentRole"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder={t('careerLevelingSystem.currentRolePlaceholder')}
                className={cn(
                  "w-full min-h-[60px]",
                  "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                  "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                  "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                )}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="experience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('careerLevelingSystem.experienceLabel')}
              </Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger className={cn(
                  "w-full",
                  "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                  "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                )}>
                  <SelectValue placeholder={t('careerLevelingSystem.experiencePlaceholder')} />
                </SelectTrigger>
                <SelectContent className={cn(
                  "border-neutral-200 dark:border-neutral-700",
                  "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                )}>
                  {Object.entries(t('careerLevelingSystem.experienceLevels', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className={cn(
                        "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-blue-100 dark:focus:bg-blue-700/50",
                        "data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-600/50"
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
            <Label htmlFor="industry" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('careerLevelingSystem.industryLabel')}
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}>
                <SelectValue placeholder={t('careerLevelingSystem.industryPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {Object.entries(t('careerLevelingSystem.industries', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-blue-100 dark:focus:bg-blue-700/50",
                      "data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-600/50"
                    )}
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="skills" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('careerLevelingSystem.skillsLabel')}
            </Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={t('careerLevelingSystem.skillsPlaceholder')}
              className={cn(
                "w-full min-h-[100px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              )}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('careerLevelingSystem.goalLabel')}
              </Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={t('careerLevelingSystem.goalPlaceholder')}
                className={cn(
                  "w-full min-h-[80px]",
                  "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                  "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                  "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                )}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="challenges" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {t('careerLevelingSystem.challengesLabel')}
              </Label>
              <Textarea
                id="challenges"
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder={t('careerLevelingSystem.challengesPlaceholder')}
                className={cn(
                  "w-full min-h-[80px]",
                  "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                  "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                  "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                )}
                rows={3}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full font-semibold",
              "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white",
              "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
            )}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('careerLevelingSystem.generating')}</>
            ) : (
              <><Briefcase className="mr-2 h-4 w-4" /> {t('careerLevelingSystem.generateButton')}</>
            )}
          </Button>
        </form>

        {error && (
          <Card className={cn(
            "mt-6",
            "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
          )}>
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">{t('careerLevelingSystem.errorTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-red-600 dark:text-red-300">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading && !generatedReport && (
          <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">{t('careerLevelingSystem.generating')}</p>
          </div>
        )}

        {generatedReport && !isLoading && (
          <Card className={cn(
            "mt-6 flex-grow flex flex-col shadow-inner",
            "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          )}>
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" /> {t('careerLevelingSystem.resultTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
              <ReactMarkdown>{generatedReport}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default CareerLevelingSystem;
