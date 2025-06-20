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
import { Loader2, Presentation, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PPTPhraseGeneratorProps {
  locale?: ValidLocale;
}

const presentationStyles = [
  { value: 'inspiring', emoji: '🔥' },
  { value: 'analytical', emoji: '📊' },
  { value: 'humorous', emoji: '😄' },
  { value: 'professional', emoji: '💼' },
  { value: 'innovative', emoji: '🚀' },
  { value: 'storytelling', emoji: '📖' },
];

const phraseTypes = [
  { value: 'title' },
  { value: 'opening' },
  { value: 'transition' },
  { value: 'conclusion' },
  { value: 'highlight' },
];

function PPTPhraseGenerator({ locale = 'zh-CN' }: PPTPhraseGeneratorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [topic, setTopic] = useState<string>('');
  const [coreMessage, setCoreMessage] = useState<string>('');
  const [presentationStyle, setPresentationStyle] = useState<string>('professional');
  const [phraseType, setPhraseType] = useState<string>('title');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [generatedPhrases, setGeneratedPhrases] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <div className="p-4 sm:p-6 rounded-lg shadow-xl flex flex-col bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!topic.trim()) {
      setError(t('pptPhraseGenerator.topicRequired'));
      setGeneratedPhrases('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPhrases('');

    const selectedStyle = presentationStyles.find(s => s.value === presentationStyle);
    const selectedType = phraseTypes.find(t => t.value === phraseType);

    // 构建AI提示词
    const styleText = `${selectedStyle?.emoji} ${t(`pptPhraseGenerator.presentationStyles.${presentationStyle}.label`)} - ${t(`pptPhraseGenerator.presentationStyles.${presentationStyle}.description`)}`;
    const typeText = `${t(`pptPhraseGenerator.phraseTypes.${phraseType}.label`)} - ${t(`pptPhraseGenerator.phraseTypes.${phraseType}.description`)}`;

    let userPrompt = t('pptPhraseGenerator.aiPrompt')
      .replace('{topic}', topic)
      .replace('{style}', styleText)
      .replace('{type}', typeText);

    if (coreMessage.trim()) {
      userPrompt = userPrompt.replace('{coreMessage}', `${locale === 'en-US' ? 'Core Message: ' : '核心观点：'}${coreMessage}\n`);
    } else {
      userPrompt = userPrompt.replace('{coreMessage}', '');
    }

    if (targetAudience.trim()) {
      userPrompt = userPrompt.replace('{audience}', `${locale === 'en-US' ? 'Target Audience: ' : '目标听众：'}${targetAudience}\n`);
    } else {
      userPrompt = userPrompt.replace('{audience}', '');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'ppt-phrase-generator',
          language: locale
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('pptPhraseGenerator.apiError') }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedPhrases(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure:', data);
        setError(t('pptPhraseGenerator.formatError'));
      }
    } catch (e) {
      console.error('Failed to generate phrases:', e);
      setError(e instanceof Error ? e.message : t('pptPhraseGenerator.unknownError'));
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <Presentation className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('pptPhraseGenerator.title')}</h1>
        <Zap className="w-8 h-8 text-yellow-500 dark:text-yellow-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="topic" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('pptPhraseGenerator.topicLabel')}
          </Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('pptPhraseGenerator.topicPlaceholder')}
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
          />
        </div>
        <div>
          <Label htmlFor="coreMessage" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('pptPhraseGenerator.coreMessageLabel')}
          </Label>
          <Textarea
            id="coreMessage"
            value={coreMessage}
            onChange={(e) => setCoreMessage(e.target.value)}
            placeholder={t('pptPhraseGenerator.coreMessagePlaceholder')}
            className={cn(
              "w-full min-h-[80px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="presentationStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('pptPhraseGenerator.presentationStyleLabel')}
            </Label>
            <Select value={presentationStyle} onValueChange={setPresentationStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder={t('pptPhraseGenerator.presentationStylePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {presentationStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {t(`pptPhraseGenerator.presentationStyles.${style.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`pptPhraseGenerator.presentationStyles.${style.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phraseType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('pptPhraseGenerator.phraseTypeLabel')}
            </Label>
            <Select value={phraseType} onValueChange={setPhraseType}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder={t('pptPhraseGenerator.phraseTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {phraseTypes.map(type => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{t(`pptPhraseGenerator.phraseTypes.${type.value}.label`)}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{t(`pptPhraseGenerator.phraseTypes.${type.value}.description`)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('pptPhraseGenerator.targetAudienceLabel')}
          </Label>
          <Input
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder={t('pptPhraseGenerator.targetAudiencePlaceholder')}
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-yellow-500 hover:bg-yellow-600 text-neutral-900 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-neutral-900",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('pptPhraseGenerator.generating')}</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {t('pptPhraseGenerator.generateButton')}</>
          )}
        </Button>
      </form>

      {error && (
        <Card className={cn(
          "mb-6",
          "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30"
        )}>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{t('pptPhraseGenerator.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedPhrases && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 dark:text-yellow-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">{t('pptPhraseGenerator.loadingMessage')}</p>
        </div>
      )}

      {generatedPhrases && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> {t('pptPhraseGenerator.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedPhrases}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PPTPhraseGenerator;
