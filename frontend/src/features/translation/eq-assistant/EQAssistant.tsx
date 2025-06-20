'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Brain, Heart, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EQAssistantProps {
  locale: ValidLocale;
}

function EQAssistant({ locale }: EQAssistantProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [scenario, setScenario] = useState<string>('upward');
  const [situationDescription, setSituationDescription] = useState<string>('');
  const [communicationGoal, setCommunicationGoal] = useState<string>('');
  const [eqAdvice, setEqAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const communicationScenarios = React.useMemo(() => [
    { value: 'upward', label: t('eqAssistant.scenarios.upward.label'), emoji: t('eqAssistant.scenarios.upward.emoji'), description: t('eqAssistant.scenarios.upward.description') },
    { value: 'downward', label: t('eqAssistant.scenarios.downward.label'), emoji: t('eqAssistant.scenarios.downward.emoji'), description: t('eqAssistant.scenarios.downward.description') },
    { value: 'peer', label: t('eqAssistant.scenarios.peer.label'), emoji: t('eqAssistant.scenarios.peer.emoji'), description: t('eqAssistant.scenarios.peer.description') },
    { value: 'client', label: t('eqAssistant.scenarios.client.label'), emoji: t('eqAssistant.scenarios.client.emoji'), description: t('eqAssistant.scenarios.client.description') },
    { value: 'conflict', label: t('eqAssistant.scenarios.conflict.label'), emoji: t('eqAssistant.scenarios.conflict.emoji'), description: t('eqAssistant.scenarios.conflict.description') },
    { value: 'feedback', label: t('eqAssistant.scenarios.feedback.label'), emoji: t('eqAssistant.scenarios.feedback.emoji'), description: t('eqAssistant.scenarios.feedback.description') },
    { value: 'negotiation', label: t('eqAssistant.scenarios.negotiation.label'), emoji: t('eqAssistant.scenarios.negotiation.emoji'), description: t('eqAssistant.scenarios.negotiation.description') },
    { value: 'presentation', label: t('eqAssistant.scenarios.presentation.label'), emoji: t('eqAssistant.scenarios.presentation.emoji'), description: t('eqAssistant.scenarios.presentation.description') },
  ], [t, translationsLoading]);

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading translations...</span>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situationDescription.trim()) {
      setError(t('eqAssistant.emptyInputError'));
      setEqAdvice('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEqAdvice('');

    const selectedScenario = communicationScenarios.find(s => s.value === scenario);

    const userPrompt = locale === 'zh-CN' ? `
场景类型：${selectedScenario?.label} - ${selectedScenario?.description}
具体情况：${situationDescription}
${communicationGoal.trim() ? `沟通目标：${communicationGoal}` : ''}

请为我提供高情商的沟通策略和具体话术建议。
` : `
Scenario Type: ${selectedScenario?.label} - ${selectedScenario?.description}
Specific Situation: ${situationDescription}
${communicationGoal.trim() ? `Communication Goal: ${communicationGoal}` : ''}

Please provide me with high emotional intelligence communication strategies and specific dialogue suggestions.
`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'eq-assistant',
        }),
      });

      if (!response.ok) {
        const defaultErrorMessage = locale === 'zh-CN'
          ? '情商助手暂时下线，可能在学习新的沟通技巧。'
          : 'EQ assistant is temporarily offline, possibly learning new communication skills.';
        const errorData = await response.json().catch(() => ({ message: defaultErrorMessage }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setEqAdvice(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        const unexpectedResponseError = locale === 'zh-CN'
          ? 'AI返回的建议格式有误，情商助手可能在思考人生...🤔'
          : 'The AI suggestion format is incorrect, the EQ assistant might be contemplating life...🤔';
        setError(unexpectedResponseError);
      }
    } catch (e) {
      console.error('Failed to get EQ advice:', e);
      const unknownError = locale === 'zh-CN'
        ? '获取情商建议时发生未知错误，助手的情商可能也需要充值！💡'
        : 'An unknown error occurred while getting EQ advice, the assistant\'s EQ might need a recharge too!💡';
      setError(e instanceof Error ? e.message : unknownError);
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('eqAssistant.title')}</h1>
        <Brain className="w-8 h-8 text-pink-600 dark:text-pink-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="scenario" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('eqAssistant.scenarioLabel')}
          </Label>
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder={t('eqAssistant.scenarioPlaceholder')} />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {communicationScenarios.map(scene => (
                <SelectItem
                  key={scene.value}
                  value={scene.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  <div className="flex flex-col">
                    <span>{scene.emoji} {scene.label}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{scene.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="situationDescription" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('eqAssistant.situationLabel')}
          </Label>
          <Textarea
            id="situationDescription"
            value={situationDescription}
            onChange={(e) => setSituationDescription(e.target.value)}
            placeholder={t('eqAssistant.situationPlaceholder')}
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="communicationGoal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('eqAssistant.goalLabel')}
          </Label>
          <Textarea
            id="communicationGoal"
            value={communicationGoal}
            onChange={(e) => setCommunicationGoal(e.target.value)}
            placeholder={t('eqAssistant.goalPlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('eqAssistant.analyzing')}</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('eqAssistant.analyzeButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('eqAssistant.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !eqAdvice && (
        <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-600 dark:text-pink-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('eqAssistant.loadingText')}</p>
        </div>
      )}

      {eqAdvice && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-pink-700 dark:text-pink-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> {t('eqAssistant.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{eqAdvice}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EQAssistant;
