'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Users } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingSpeechGeneratorProps {
  locale: ValidLocale;
}

function MeetingSpeechGenerator({ locale }: MeetingSpeechGeneratorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [meetingTopic, setMeetingTopic] = useState<string>('');
  const [speechType, setSpeechType] = useState<string>('opening');
  const [duration, setDuration] = useState<string>('3');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [generatedSpeech, setGeneratedSpeech] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 使用翻译的发言类型
  const speechTypes = React.useMemo(() => [
    { value: 'opening', label: t('meetingSpeechGenerator.speechTypes.opening') },
    { value: 'summary', label: t('meetingSpeechGenerator.speechTypes.summary') },
    { value: 'proposal', label: t('meetingSpeechGenerator.speechTypes.proposal') },
    { value: 'question', label: t('meetingSpeechGenerator.speechTypes.question') },
    { value: 'opposition', label: t('meetingSpeechGenerator.speechTypes.opposition') },
    { value: 'support', label: t('meetingSpeechGenerator.speechTypes.support') },
    { value: 'closing', label: t('meetingSpeechGenerator.speechTypes.closing') },
    { value: 'update', label: t('meetingSpeechGenerator.speechTypes.update') },
  ], [t, translationsLoading]);

  // 使用翻译的发言时长
  const speechDurations = React.useMemo(() => [
    { value: '1', label: t('meetingSpeechGenerator.durations.1') },
    { value: '3', label: t('meetingSpeechGenerator.durations.3') },
    { value: '5', label: t('meetingSpeechGenerator.durations.5') },
    { value: '10', label: t('meetingSpeechGenerator.durations.10') },
  ], [t, translationsLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!meetingTopic.trim()) {
      setError(t('meetingSpeechGenerator.topicRequired'));
      setGeneratedSpeech('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedSpeech('');

    const selectedType = speechTypes.find(type => type.value === speechType);
    const selectedDuration = speechDurations.find(dur => dur.value === duration);

    let userPrompt = t('meetingSpeechGenerator.aiPrompt', {
      duration: selectedDuration?.label,
      speechType: selectedType?.label,
      topic: meetingTopic,
      additionalInfo: additionalInfo.trim() ? `\n\n补充信息：${additionalInfo}` : ''
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'meeting-speech-generator',
          locale: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('meetingSpeechGenerator.errors.generation') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedSpeech(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for speech generation:', data);
        setError(t('meetingSpeechGenerator.errors.formatError'));
      }
    } catch (e) {
      console.error('Failed to generate speech:', e);
      setError(e instanceof Error ? e.message : t('meetingSpeechGenerator.errors.unknownError'));
    } finally {
      setIsLoading(false);
    }
  }

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
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
        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('meetingSpeechGenerator.title')}</h1>
        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="meetingTopic" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('meetingSpeechGenerator.topicLabel')}
          </Label>
          <Input
            id="meetingTopic"
            value={meetingTopic}
            onChange={(e) => setMeetingTopic(e.target.value)}
            placeholder={t('meetingSpeechGenerator.topicPlaceholder')}
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speechType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('meetingSpeechGenerator.speechTypeLabel')}
            </Label>
            <Select value={speechType} onValueChange={setSpeechType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
              )}>
                <SelectValue placeholder={t('meetingSpeechGenerator.speechTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {speechTypes.map(type => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                      "focus:bg-sky-100 dark:focus:bg-sky-700"
                    )}
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('meetingSpeechGenerator.durationLabel')}
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
              )}>
                <SelectValue placeholder={t('meetingSpeechGenerator.durationPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {speechDurations.map(dur => (
                  <SelectItem
                    key={dur.value}
                    value={dur.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                      "focus:bg-sky-100 dark:focus:bg-sky-700"
                    )}
                  >
                    {dur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="additionalInfo" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('meetingSpeechGenerator.additionalInfoLabel')}
          </Label>
          <Textarea
            id="additionalInfo"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder={t('meetingSpeechGenerator.additionalInfoPlaceholder')}
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
            "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('meetingSpeechGenerator.generating')}
            </>
          ) : (
            <><Mic className="mr-2 h-4 w-4" /> {t('meetingSpeechGenerator.generateButton')}
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('meetingSpeechGenerator.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedSpeech && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('meetingSpeechGenerator.loadingMessage')}</p>
        </div>
      )}

      {generatedSpeech && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center">
              <Mic className="w-5 h-5 mr-2" /> {t('meetingSpeechGenerator.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedSpeech}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingSpeechGenerator;
