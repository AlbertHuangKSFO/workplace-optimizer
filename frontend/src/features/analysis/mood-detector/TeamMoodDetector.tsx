'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Heart, Loader2, Sparkles, TrendingUp, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TeamMoodDetectorProps {
  locale: ValidLocale;
}

function TeamMoodDetector({ locale }: TeamMoodDetectorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [teamSize, setTeamSize] = useState<string>('medium');
  const [observationPeriod, setObservationPeriod] = useState<string>('recent');
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [teamDescription, setTeamDescription] = useState<string>('');
  const [observedBehaviors, setObservedBehaviors] = useState<string>('');
  const [specificConcerns, setSpecificConcerns] = useState<string>('');
  const [recentEvents, setRecentEvents] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 团队规模选项
  const teamSizes = useMemo(() => [
    { value: 'small', emoji: '👥' },
    { value: 'medium', emoji: '👨‍👩‍👧‍👦' },
    { value: 'large', emoji: '🏢' },
    { value: 'department', emoji: '🏛️' },
  ], []);

  // 观察周期选项
  const observationPeriods = useMemo(() => [
    { value: 'recent', emoji: '📅' },
    { value: 'monthly', emoji: '📊' },
    { value: 'quarterly', emoji: '📈' },
    { value: 'ongoing', emoji: '🔍' },
  ], []);

  // 分析类型选项
  const analysisTypes = useMemo(() => [
    { value: 'comprehensive', emoji: '🎯' },
    { value: 'communication', emoji: '💬' },
    { value: 'collaboration', emoji: '🤝' },
    { value: 'motivation', emoji: '⚡' },
    { value: 'stress-level', emoji: '😰' },
    { value: 'satisfaction', emoji: '😊' },
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
    if (!teamDescription.trim()) {
      setError(t('teamMoodDetector.requiredField'));
      setAnalysisResult('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    const selectedTeamSize = teamSizes.find(ts => ts.value === teamSize);
    const selectedPeriod = observationPeriods.find(p => p.value === observationPeriod);
    const selectedAnalysis = analysisTypes.find(a => a.value === analysisType);

    const teamSizeLabel = t(`teamMoodDetector.teamSizes.${teamSize}.label`);
    const teamSizeDesc = t(`teamMoodDetector.teamSizes.${teamSize}.description`);
    const periodLabel = t(`teamMoodDetector.observationPeriods.${observationPeriod}.label`);
    const periodDesc = t(`teamMoodDetector.observationPeriods.${observationPeriod}.description`);
    const analysisLabel = t(`teamMoodDetector.analysisTypes.${analysisType}.label`);
    const analysisDesc = t(`teamMoodDetector.analysisTypes.${analysisType}.description`);

    const userPrompt = locale === 'zh-CN' ? `
团队规模：${teamSizeLabel} - ${teamSizeDesc}
观察周期：${periodLabel} - ${periodDesc}
分析重点：${analysisLabel} - ${analysisDesc}

团队描述：
${teamDescription}

${observedBehaviors.trim() ? `观察到的行为：${observedBehaviors}` : ''}
${specificConcerns.trim() ? `具体关注点：${specificConcerns}` : ''}
${recentEvents.trim() ? `近期重要事件：${recentEvents}` : ''}

请分析团队氛围状况，提供专业的评估报告和改进建议。
` : `
Team Size: ${teamSizeLabel} - ${teamSizeDesc}
Observation Period: ${periodLabel} - ${periodDesc}
Analysis Focus: ${analysisLabel} - ${analysisDesc}

Team Description:
${teamDescription}

${observedBehaviors.trim() ? `Observed Behaviors: ${observedBehaviors}` : ''}
${specificConcerns.trim() ? `Specific Concerns: ${specificConcerns}` : ''}
${recentEvents.trim() ? `Recent Important Events: ${recentEvents}` : ''}

Please analyze the team atmosphere and provide a professional assessment report and improvement suggestions.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'team-mood-detector',
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('teamMoodDetector.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAnalysisResult(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('teamMoodDetector.formatError'));
      }
    } catch (e) {
      console.error('Failed to analyze team mood:', e);
      setError(e instanceof Error ? e.message : t('teamMoodDetector.unknownError'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Users className="w-8 h-8 text-cyan-500 dark:text-cyan-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('teamMoodDetector.title')}</h1>
        <Heart className="w-8 h-8 text-cyan-500 dark:text-cyan-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="teamSize" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('teamMoodDetector.teamSizeLabel')}
            </Label>
            <Select value={teamSize} onValueChange={setTeamSize}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}>
                <SelectValue placeholder={t('teamMoodDetector.teamSizePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {teamSizes.map(size => (
                  <SelectItem
                    key={size.value}
                    value={size.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-cyan-100 dark:focus:bg-cyan-700/50",
                      "data-[state=checked]:bg-cyan-200 dark:data-[state=checked]:bg-cyan-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{size.emoji} {t(`teamMoodDetector.teamSizes.${size.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`teamMoodDetector.teamSizes.${size.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="observationPeriod" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('teamMoodDetector.observationPeriodLabel')}
            </Label>
            <Select value={observationPeriod} onValueChange={setObservationPeriod}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}>
                <SelectValue placeholder={t('teamMoodDetector.observationPeriodPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {observationPeriods.map(period => (
                  <SelectItem
                    key={period.value}
                    value={period.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-cyan-100 dark:focus:bg-cyan-700/50",
                      "data-[state=checked]:bg-cyan-200 dark:data-[state=checked]:bg-cyan-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{period.emoji} {t(`teamMoodDetector.observationPeriods.${period.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`teamMoodDetector.observationPeriods.${period.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="analysisType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('teamMoodDetector.analysisTypeLabel')}
            </Label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}>
                <SelectValue placeholder={t('teamMoodDetector.analysisTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {analysisTypes.map(analysis => (
                  <SelectItem
                    key={analysis.value}
                    value={analysis.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-cyan-100 dark:focus:bg-cyan-700/50",
                      "data-[state=checked]:bg-cyan-200 dark:data-[state=checked]:bg-cyan-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{analysis.emoji} {t(`teamMoodDetector.analysisTypes.${analysis.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`teamMoodDetector.analysisTypes.${analysis.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="teamDescription" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('teamMoodDetector.teamDescriptionLabel')}
          </Label>
          <Textarea
            id="teamDescription"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
            placeholder={t('teamMoodDetector.teamDescriptionPlaceholder')}
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
            )}
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="observedBehaviors" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('teamMoodDetector.observedBehaviorsLabel')}
          </Label>
          <Textarea
            id="observedBehaviors"
            value={observedBehaviors}
            onChange={(e) => setObservedBehaviors(e.target.value)}
            placeholder={t('teamMoodDetector.observedBehaviorsPlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
            )}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specificConcerns" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('teamMoodDetector.specificConcernsLabel')}
            </Label>
            <Textarea
              id="specificConcerns"
              value={specificConcerns}
              onChange={(e) => setSpecificConcerns(e.target.value)}
              placeholder={t('teamMoodDetector.specificConcernsPlaceholder')}
              className={cn(
                "w-full min-h-[60px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="recentEvents" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('teamMoodDetector.recentEventsLabel')}
            </Label>
            <Textarea
              id="recentEvents"
              value={recentEvents}
              onChange={(e) => setRecentEvents(e.target.value)}
              placeholder={t('teamMoodDetector.recentEventsPlaceholder')}
              className={cn(
                "w-full min-h-[60px]",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-cyan-500 focus:border-cyan-500 dark:focus:ring-cyan-500 dark:focus:border-cyan-500"
              )}
              rows={2}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-cyan-600 hover:bg-cyan-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-white",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('teamMoodDetector.analyzing')}</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('teamMoodDetector.analyzeButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('teamMoodDetector.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !analysisResult && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-500 dark:text-cyan-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('teamMoodDetector.loadingMessage')}</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" /> {t('teamMoodDetector.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysisResult}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TeamMoodDetector;
