'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Briefcase, Lightbulb, RotateCcw, Target, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingType {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

interface PerformanceEffect {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

interface ImpressiveMeetingPhrasesProps {
  locale: ValidLocale;
}

function ImpressiveMeetingPhrases({ locale }: ImpressiveMeetingPhrasesProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [meetingType, setMeetingType] = useState<string>('');
  const [effect, setEffect] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);

  if (translationsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  const meetingTypes: MeetingType[] = [
    {
      id: 'strategy',
      label: t('impressiveMeetingPhrases.meetingTypes.strategy.label'),
      emoji: '🎯',
      description: t('impressiveMeetingPhrases.meetingTypes.strategy.description')
    },
    {
      id: 'product',
      label: t('impressiveMeetingPhrases.meetingTypes.product.label'),
      emoji: '💡',
      description: t('impressiveMeetingPhrases.meetingTypes.product.description')
    },
    {
      id: 'project',
      label: t('impressiveMeetingPhrases.meetingTypes.project.label'),
      emoji: '📊',
      description: t('impressiveMeetingPhrases.meetingTypes.project.description')
    },
    {
      id: 'review',
      label: t('impressiveMeetingPhrases.meetingTypes.review.label'),
      emoji: '🔍',
      description: t('impressiveMeetingPhrases.meetingTypes.review.description')
    },
    {
      id: 'brainstorm',
      label: t('impressiveMeetingPhrases.meetingTypes.brainstorm.label'),
      emoji: '🌪️',
      description: t('impressiveMeetingPhrases.meetingTypes.brainstorm.description')
    },
    {
      id: 'general',
      label: t('impressiveMeetingPhrases.meetingTypes.general.label'),
      emoji: '🎭',
      description: t('impressiveMeetingPhrases.meetingTypes.general.description')
    }
  ];

  const performanceEffects: PerformanceEffect[] = [
    {
      id: 'thoughtful',
      label: t('impressiveMeetingPhrases.performanceEffects.thoughtful.label'),
      emoji: '🤔',
      description: t('impressiveMeetingPhrases.performanceEffects.thoughtful.description')
    },
    {
      id: 'proactive',
      label: t('impressiveMeetingPhrases.performanceEffects.proactive.label'),
      emoji: '🙋‍♂️',
      description: t('impressiveMeetingPhrases.performanceEffects.proactive.description')
    },
    {
      id: 'strategic',
      label: t('impressiveMeetingPhrases.performanceEffects.strategic.label'),
      emoji: '🎯',
      description: t('impressiveMeetingPhrases.performanceEffects.strategic.description')
    },
    {
      id: 'analytical',
      label: t('impressiveMeetingPhrases.performanceEffects.analytical.label'),
      emoji: '📈',
      description: t('impressiveMeetingPhrases.performanceEffects.analytical.description')
    },
    {
      id: 'innovative',
      label: t('impressiveMeetingPhrases.performanceEffects.innovative.label'),
      emoji: '💡',
      description: t('impressiveMeetingPhrases.performanceEffects.innovative.description')
    },
    {
      id: 'safe',
      label: t('impressiveMeetingPhrases.performanceEffects.safe.label'),
      emoji: '🛡️',
      description: t('impressiveMeetingPhrases.performanceEffects.safe.description')
    }
  ];

  const handleSubmit = async () => {
    if (!meetingType || !effect) {
      setError(t('impressiveMeetingPhrases.selectionRequired'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const selectedMeetingType = meetingTypes.find(t => t.id === meetingType);
      const selectedEffect = performanceEffects.find(e => e.id === effect);

      let prompt = `会议类型：${selectedMeetingType?.label} (${selectedMeetingType?.description})\n`;
      prompt += `表演效果：${selectedEffect?.label} (${selectedEffect?.description})\n`;

      if (customTopic.trim()) {
        prompt += `会议主题：${customTopic.trim()}\n`;
      }

      prompt += '\n请为我生成一些高大上的会议用语和话术，帮助我在会议中显得专业和有见地！';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          toolId: 'impressive-meeting-phrases',
          language: locale === 'zh-CN' ? 'zh' : 'en'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data.assistantMessage);
      setShowResult(true);
    } catch (error) {
      console.error('Error:', error);
      setError(t('impressiveMeetingPhrases.errors.generation'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMeetingType('');
    setEffect('');
    setCustomTopic('');
    setResult('');
    setError('');
    setShowResult(false);
  };

  const getCompletionRate = () => {
    let completed = 0;
    if (meetingType) completed++;
    if (effect) completed++;
    return Math.round((completed / 2) * 100);
  };

  return (
    <div className={cn("max-w-7xl mx-auto p-6 space-y-6", "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100")}>
      {!showResult ? (
        <div className="space-y-6">
          {/* 标题部分 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('impressiveMeetingPhrases.title')}
              </h1>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('impressiveMeetingPhrases.description')}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors flex items-center gap-1",
                "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              )}>
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t('impressiveMeetingPhrases.completionRate')}: {getCompletionRate()}%
              </div>
              <div className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors flex items-center gap-1",
                "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              )}>
                <Lightbulb className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                {t('impressiveMeetingPhrases.badge')}
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-200 dark:bg-neutral-800" />

          <div className="space-y-6">
            {/* 会议类型选择 */}
            <Card className={cn(
              "border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                  )}>
                    1
                  </span>
                  {t('impressiveMeetingPhrases.step1Title')}
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  {t('impressiveMeetingPhrases.step1Description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {meetingTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={meetingType === type.id ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 text-left justify-start",
                        meetingType === type.id ?
                          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={() => setMeetingType(type.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{type.label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{type.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 表演效果选择 */}
            <Card className={cn(
              "border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                  )}>
                    2
                  </span>
                  {t('impressiveMeetingPhrases.step2Title')}
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  {t('impressiveMeetingPhrases.step2Description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {performanceEffects.map((eff) => (
                    <Button
                      key={eff.id}
                      variant={effect === eff.id ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 text-left justify-start",
                        effect === eff.id ?
                          "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={() => setEffect(eff.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{eff.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{eff.label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">{eff.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 自定义主题（可选）*/}
            <Card className={cn(
              "border-2 hover:border-blue-300 dark:hover:border-blue-600 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                  )}>
                    ?⃝
                  </span>
                  {t('impressiveMeetingPhrases.step3Title')}
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  {t('impressiveMeetingPhrases.step3Description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="customTopic" className="sr-only">{t('impressiveMeetingPhrases.step3Title')}</Label>
                <Textarea
                  id="customTopic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={t('impressiveMeetingPhrases.customTopicPlaceholder')}
                  rows={3}
                  className={cn(
                    "w-full",
                    "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                    "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  )}
                />
              </CardContent>
            </Card>

            {error && <p className="text-red-600 dark:text-red-400 text-center py-2">{error}</p>}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !meetingType || !effect}
                className={cn(
                  "w-full max-w-md py-3 text-lg font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition-shadow",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                  "dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600",
                  "disabled:from-neutral-400 disabled:to-neutral-500 dark:disabled:from-neutral-600 dark:disabled:to-neutral-700 disabled:text-neutral-300 dark:disabled:text-neutral-400 disabled:shadow-none disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 animate-spin" />
                    {t('impressiveMeetingPhrases.generating')}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    {t('impressiveMeetingPhrases.generateButton')}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) :
        <div className="space-y-6">
          {/* 结果页标题 */}
          <div className="text-center space-y-2">
             <div className="flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
                {t('impressiveMeetingPhrases.resultTitle')}
              </h1>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              {t('impressiveMeetingPhrases.resultDescription')}
            </p>
          </div>

          <Separator className="bg-neutral-200 dark:bg-neutral-800" />

          <Card className={cn(
            "shadow-xl border-2",
            "bg-neutral-50 dark:bg-neutral-900 border-blue-200 dark:border-blue-800"
          )}>
            <CardHeader>
              <CardTitle className={cn("text-xl flex items-center gap-2", "text-blue-700 dark:text-blue-300")}>
                <Lightbulb className="w-6 h-6" />
                {t('impressiveMeetingPhrases.phrasesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className={cn(
              "prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words p-4 sm:p-6",
              "text-neutral-800 dark:text-neutral-200"
            )}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                "px-6 py-2 text-sm font-medium",
                "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('impressiveMeetingPhrases.resetButton')}
            </Button>
          </div>
        </div>
      }
    </div>
  );
}

export default ImpressiveMeetingPhrases;
