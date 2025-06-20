'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { AlertTriangle, Brain, Clock, Coffee, Lightbulb, RefreshCcw, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SanityQuestion {
  id: string;
  question: string;
  options: { value: string; label: string; emoji: string }[];
}

interface SanityCheckMeterProps {
  locale: ValidLocale;
}

function SanityCheckMeter({ locale }: SanityCheckMeterProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 如果翻译还在加载中，显示加载状态
  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // 动态构建问题数组，使用翻译
  const sanityQuestions: SanityQuestion[] = [
    {
      id: 'energy',
      question: t('sanityCheckMeter.questions.energy.question'),
      options: [
        { value: 'zombie', label: t('sanityCheckMeter.questions.energy.options.zombie.label'), emoji: t('sanityCheckMeter.questions.energy.options.zombie.emoji') },
        { value: 'tired', label: t('sanityCheckMeter.questions.energy.options.tired.label'), emoji: t('sanityCheckMeter.questions.energy.options.tired.emoji') },
        { value: 'normal', label: t('sanityCheckMeter.questions.energy.options.normal.label'), emoji: t('sanityCheckMeter.questions.energy.options.normal.emoji') },
        { value: 'energetic', label: t('sanityCheckMeter.questions.energy.options.energetic.label'), emoji: t('sanityCheckMeter.questions.energy.options.energetic.emoji') },
        { value: 'hyperactive', label: t('sanityCheckMeter.questions.energy.options.hyperactive.label'), emoji: t('sanityCheckMeter.questions.energy.options.hyperactive.emoji') }
      ]
    },
    {
      id: 'workload',
      question: t('sanityCheckMeter.questions.workload.question'),
      options: [
        { value: 'overwhelming', label: t('sanityCheckMeter.questions.workload.options.overwhelming.label'), emoji: t('sanityCheckMeter.questions.workload.options.overwhelming.emoji') },
        { value: 'heavy', label: t('sanityCheckMeter.questions.workload.options.heavy.label'), emoji: t('sanityCheckMeter.questions.workload.options.heavy.emoji') },
        { value: 'moderate', label: t('sanityCheckMeter.questions.workload.options.moderate.label'), emoji: t('sanityCheckMeter.questions.workload.options.moderate.emoji') },
        { value: 'light', label: t('sanityCheckMeter.questions.workload.options.light.label'), emoji: t('sanityCheckMeter.questions.workload.options.light.emoji') },
        { value: 'bored', label: t('sanityCheckMeter.questions.workload.options.bored.label'), emoji: t('sanityCheckMeter.questions.workload.options.bored.emoji') }
      ]
    },
    {
      id: 'mood',
      question: t('sanityCheckMeter.questions.mood.question'),
      options: [
        { value: 'depressed', label: t('sanityCheckMeter.questions.mood.options.depressed.label'), emoji: t('sanityCheckMeter.questions.mood.options.depressed.emoji') },
        { value: 'frustrated', label: t('sanityCheckMeter.questions.mood.options.frustrated.label'), emoji: t('sanityCheckMeter.questions.mood.options.frustrated.emoji') },
        { value: 'neutral', label: t('sanityCheckMeter.questions.mood.options.neutral.label'), emoji: t('sanityCheckMeter.questions.mood.options.neutral.emoji') },
        { value: 'happy', label: t('sanityCheckMeter.questions.mood.options.happy.label'), emoji: t('sanityCheckMeter.questions.mood.options.happy.emoji') },
        { value: 'ecstatic', label: t('sanityCheckMeter.questions.mood.options.ecstatic.label'), emoji: t('sanityCheckMeter.questions.mood.options.ecstatic.emoji') }
      ]
    },
    {
      id: 'focus',
      question: t('sanityCheckMeter.questions.focus.question'),
      options: [
        { value: 'scattered', label: t('sanityCheckMeter.questions.focus.options.scattered.label'), emoji: t('sanityCheckMeter.questions.focus.options.scattered.emoji') },
        { value: 'distracted', label: t('sanityCheckMeter.questions.focus.options.distracted.label'), emoji: t('sanityCheckMeter.questions.focus.options.distracted.emoji') },
        { value: 'okay', label: t('sanityCheckMeter.questions.focus.options.okay.label'), emoji: t('sanityCheckMeter.questions.focus.options.okay.emoji') },
        { value: 'focused', label: t('sanityCheckMeter.questions.focus.options.focused.label'), emoji: t('sanityCheckMeter.questions.focus.options.focused.emoji') },
        { value: 'laser', label: t('sanityCheckMeter.questions.focus.options.laser.label'), emoji: t('sanityCheckMeter.questions.focus.options.laser.emoji') }
      ]
    }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < sanityQuestions.length) {
      setError(t('sanityCheckMeter.errors.incompleteAnswers'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userInput = sanityQuestions.map(q => {
        const selectedOption = q.options.find(opt => opt.value === answers[q.id]);
        return `${q.question} ${selectedOption?.emoji} ${selectedOption?.label}`;
      }).join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          toolId: 'sanity-check-meter',
          language: locale === 'zh-CN' ? 'zh' : 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.assistantMessage || t('sanityCheckMeter.errors.resultGenerationFailed'));
    } catch (err: any) {
      console.error(t('sanityCheckMeter.errors.checkFailed'), err);
      setError(`${t('sanityCheckMeter.errors.diagnosisFailed')}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult('');
    setError('');
  };

  const getCompletionRate = () => {
    return Math.round((Object.keys(answers).length / sanityQuestions.length) * 100);
  };

  return (
    <div className={cn("max-w-4xl mx-auto p-6 space-y-6", "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100")}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            {t('sanityCheckMeter.title')}
          </h1>
          <AlertTriangle className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          {t('sanityCheckMeter.description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className={cn("flex items-center gap-1", "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300")}>
            <Clock className="w-4 h-4" />
            {t('sanityCheckMeter.completionRate')}: {getCompletionRate()}%
          </Badge>
          <Badge variant="outline" className={cn("flex items-center gap-1", "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300")}>
            <Coffee className="w-4 h-4" />
            {t('sanityCheckMeter.informalDiagnosis')}
          </Badge>
        </div>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {!result ? (
        <div className="space-y-6">
          {sanityQuestions.map((question, index) => (
            <Card key={question.id} className={cn(
              "border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors",
              "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2 text-lg", "text-neutral-800 dark:text-neutral-200")}>
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    "bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300"
                  )}>
                    {index + 1}
                  </span>
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {question.options.map((option) => (
                    <Button
                      key={option.value}
                      variant={answers[question.id] === option.value ? "default" : "outline"}
                      className={cn(
                        "h-auto p-4 text-left justify-start",
                        answers[question.id] === option.value ?
                          "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white dark:text-white" :
                          "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                      onClick={() => handleAnswerChange(question.id, option.value)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {error && (
            <Card className={cn("border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/20")}>
              <CardContent className="pt-6">
                <p className="text-red-700 dark:text-red-400 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(answers).length < sanityQuestions.length}
              className={cn(
                "px-8 py-3 text-lg",
                "bg-purple-600 hover:bg-purple-700 text-white",
                "dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white",
                "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 animate-spin" />
                  {t('sanityCheckMeter.buttons.submitting')}
                </div>
              ) : (
                t('sanityCheckMeter.buttons.submit')
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Card className={cn("shadow-xl", "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800")}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Lightbulb className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300">{t('sanityCheckMeter.result.title')}</CardTitle>
            </div>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              {t('sanityCheckMeter.result.description')}
            </CardDescription>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300">
                {t('sanityCheckMeter.result.aiGenerated')}
              </Badge>
              <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                {t('sanityCheckMeter.result.sanityLevel')}
              </Badge>
            </div>
          </CardHeader>

          <Separator className="my-4 bg-neutral-200 dark:bg-neutral-800" />

          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </CardContent>

          <Separator className="mb-4 bg-neutral-200 dark:bg-neutral-800" />

          <div className="p-6 text-center">
            <Button onClick={handleReset} variant="outline" className={cn(
              "px-6 py-2",
              "border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/30"
            )}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t('sanityCheckMeter.buttons.reset')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SanityCheckMeter;
