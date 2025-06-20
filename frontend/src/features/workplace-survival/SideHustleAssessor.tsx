'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { AlertTriangle, Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  locale: ValidLocale;
}

function SideHustleAssessor({ locale }: Props): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [currentJob, setCurrentJob] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [interests, setInterests] = useState<string>('');
  const [budget, setBudget] = useState<string>('low');
  const [timeCommitment, setTimeCommitment] = useState<string>('medium');
  const [experience, setExperience] = useState<string>('beginner');
  const [riskTolerance, setRiskTolerance] = useState<string>('medium');
  const [assessment, setAssessment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentJob.trim() || !skills.trim() || !interests.trim()) {
      setError(t('sideHustleAssessor.emptyFieldsError'));
      setAssessment('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAssessment('');

    const userPrompt = `
${t('sideHustleAssessor.currentJobLabel')} ${currentJob}
${t('sideHustleAssessor.skillsLabel')} ${skills}
${t('sideHustleAssessor.interestsLabel')} ${interests}
${t('sideHustleAssessor.budgetLabel')} ${t(`sideHustleAssessor.budgetRanges.${budget}`)}
${t('sideHustleAssessor.timeCommitmentLabel')} ${t(`sideHustleAssessor.timeCommitments.${timeCommitment}`)}
${t('sideHustleAssessor.experienceLabel')} ${t(`sideHustleAssessor.experienceLevels.${experience}`)}
${t('sideHustleAssessor.riskToleranceLabel')} ${t(`sideHustleAssessor.riskTolerances.${riskTolerance}`)}

Please assess my side hustle potential and provide recommendations.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'side-hustle-assessor',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('sideHustleAssessor.errorTitle') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.assistantMessage) {
        setAssessment(data.assistantMessage);
      } else {
        setError(t('sideHustleAssessor.errorTitle'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('sideHustleAssessor.errorTitle'));
    } finally {
      setIsLoading(false);
    }
  }, [currentJob, skills, interests, budget, timeCommitment, experience, riskTolerance, locale, t]);

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
      "w-full max-w-9xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <Lightbulb className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
          {t('sideHustleAssessor.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          {t('sideHustleAssessor.description')}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-0 py-4 flex-shrink-0">
        <div>
          <Label htmlFor="currentJob" className="block text-sm font-medium mb-1">
            {t('sideHustleAssessor.currentJobLabel')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="currentJob"
            type="text"
            value={currentJob}
            onChange={(e) => setCurrentJob(e.target.value)}
            placeholder={t('sideHustleAssessor.currentJobPlaceholder')}
            required
          />
        </div>

        <div>
          <Label htmlFor="skills" className="block text-sm font-medium mb-1">
            {t('sideHustleAssessor.skillsLabel')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder={t('sideHustleAssessor.skillsPlaceholder')}
            className="min-h-[100px]"
            required
          />
        </div>

        <div>
          <Label htmlFor="interests" className="block text-sm font-medium mb-1">
            {t('sideHustleAssessor.interestsLabel')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder={t('sideHustleAssessor.interestsPlaceholder')}
            className="min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget" className="block text-sm font-medium mb-1">
              {t('sideHustleAssessor.budgetLabel')}
            </Label>
            <Select value={budget} onValueChange={setBudget}>
              <SelectTrigger id="budget">
                <SelectValue placeholder={t('sideHustleAssessor.budgetPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t('sideHustleAssessor.budgetRanges', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timeCommitment" className="block text-sm font-medium mb-1">
              {t('sideHustleAssessor.timeCommitmentLabel')}
            </Label>
            <Select value={timeCommitment} onValueChange={setTimeCommitment}>
              <SelectTrigger id="timeCommitment">
                <SelectValue placeholder={t('sideHustleAssessor.timeCommitmentPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t('sideHustleAssessor.timeCommitments', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experience" className="block text-sm font-medium mb-1">
              {t('sideHustleAssessor.experienceLabel')}
            </Label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger id="experience">
                <SelectValue placeholder={t('sideHustleAssessor.experiencePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t('sideHustleAssessor.experienceLevels', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="riskTolerance" className="block text-sm font-medium mb-1">
              {t('sideHustleAssessor.riskToleranceLabel')}
            </Label>
            <Select value={riskTolerance} onValueChange={setRiskTolerance}>
              <SelectTrigger id="riskTolerance">
                <SelectValue placeholder={t('sideHustleAssessor.riskTolerancePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(t('sideHustleAssessor.riskTolerances', { returnObjects: true }) as Record<string, string>).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full !mt-6 text-base py-3">
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('sideHustleAssessor.assessing')}</>
          ) : (
            <><TrendingUp className="mr-2 h-5 w-5" /> {t('sideHustleAssessor.assessButton')}</>
          )}
        </Button>
      </form>

      <CardContent className="flex-grow flex flex-col space-y-6 px-4 sm:px-0 py-4 min-h-0">
        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-400 flex items-start flex-shrink-0">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading && !assessment && !error && (
          <div className="text-center py-10 flex flex-col items-center justify-center flex-grow">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 dark:text-yellow-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">{t('sideHustleAssessor.assessing')}</p>
          </div>
        )}

        {assessment && !isLoading && (
          <div className="mt-6 flex flex-col flex-grow min-h-0">
            <h3 className="text-xl font-semibold mb-3 text-center text-yellow-700 dark:text-yellow-300 flex-shrink-0">
              <Sparkles className="inline-block w-6 h-6 mr-2" /> {t('sideHustleAssessor.resultTitle')}
            </h3>
            <div className="relative p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto min-h-[450px]">
              <ReactMarkdown>{assessment}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SideHustleAssessor;
