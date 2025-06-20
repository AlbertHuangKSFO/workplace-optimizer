'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Lightbulb, Loader2, Quote } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingDoodleBuddyProps {
  locale: ValidLocale;
}

function MeetingDoodleBuddy({ locale }: MeetingDoodleBuddyProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [keywords, setKeywords] = useState<string>('');
  const [doodleStyle, setDoodleStyle] = useState<string>('doodle');
  const [mode, setMode] = useState<'idea' | 'image'>('idea');
  const [doodleIdea, setDoodleIdea] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 使用翻译的涂鸦风格
  const doodleStyles = React.useMemo(() => [
    { value: 'simple', label: t('meetingDoodleBuddy.styles.simple') },
    { value: 'cartoon', label: t('meetingDoodleBuddy.styles.cartoon') },
    { value: 'sketch', label: t('meetingDoodleBuddy.styles.sketch') },
    { value: 'doodle', label: t('meetingDoodleBuddy.styles.doodle') },
    { value: 'minimalist', label: t('meetingDoodleBuddy.styles.minimalist') },
  ], [t, translationsLoading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setDoodleIdea('');
    setGeneratedImage('');

    if (mode === 'idea') {
      // 生成涂鸦灵感文字描述
      const userMessage = keywords.trim()
        ? t('meetingDoodleBuddy.prompts.withKeywords', { keywords })
        : t('meetingDoodleBuddy.prompts.withoutKeywords');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userMessage }],
            toolId: 'meeting-doodle-buddy',
            locale: locale,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: t('meetingDoodleBuddy.errors.ideaGeneration') }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.assistantMessage) {
          setDoodleIdea(data.assistantMessage);
        } else {
          console.warn('Unexpected API response structure for doodle idea:', data);
          setError(t('meetingDoodleBuddy.errors.formatError'));
        }
      } catch (e) {
        console.error('Failed to fetch doodle idea:', e);
        setError(e instanceof Error ? e.message : t('meetingDoodleBuddy.errors.unknownError'));
      }
    } else {
      // 生成涂鸦图片
      const selectedStyle = doodleStyles.find(s => s.value === doodleStyle);
      const prompt = keywords.trim()
        ? t('meetingDoodleBuddy.prompts.imageWithKeywords', { style: selectedStyle?.label, keywords })
        : t('meetingDoodleBuddy.prompts.imageWithoutKeywords', { style: selectedStyle?.label });

      try {
        const response = await fetch('/api/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            style: doodleStyle,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: t('meetingDoodleBuddy.errors.imageGeneration') }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.imageUrl) {
          setGeneratedImage(data.imageUrl);
        } else {
          console.warn('Unexpected API response structure for image generation:', data);
          setError(t('meetingDoodleBuddy.errors.formatError'));
        }
      } catch (e) {
        console.error('Failed to generate image:', e);
        setError(e instanceof Error ? e.message : t('meetingDoodleBuddy.errors.unknownError'));
      }
    }

    setIsLoading(false);
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
        <Quote className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-2 transform scale-x-[-1]" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('meetingDoodleBuddy.title')}</h1>
        <Quote className="w-8 h-8 text-teal-600 dark:text-teal-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              {t('meetingDoodleBuddy.modeLabel')}
            </Label>
            <Select value={mode} onValueChange={(value: 'idea' | 'image') => setMode(value)}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
              )}>
                <SelectValue placeholder={t('meetingDoodleBuddy.modePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                <SelectItem
                  value="idea"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {t('meetingDoodleBuddy.modes.idea')}
                </SelectItem>
                <SelectItem
                  value="image"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {t('meetingDoodleBuddy.modes.image')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === 'image' && (
            <div>
              <Label htmlFor="doodleStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('meetingDoodleBuddy.styleLabel')}
              </Label>
              <Select value={doodleStyle} onValueChange={setDoodleStyle}>
                <SelectTrigger className={cn(
                  "w-full",
                  "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                  "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
                )}>
                  <SelectValue placeholder={t('meetingDoodleBuddy.stylePlaceholder')} />
                </SelectTrigger>
                <SelectContent className={cn(
                  "border-neutral-200 dark:border-neutral-700",
                  "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                )}>
                  {doodleStyles.map(style => (
                    <SelectItem
                      key={style.value}
                      value={style.value}
                      className={cn(
                        "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                        "focus:bg-sky-100 dark:focus:bg-sky-700"
                      )}
                    >
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {mode === 'image' && (
          <div className={cn(
            "rounded-lg p-3 text-sm",
            "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-300"
          )}>
            <p className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              {t('meetingDoodleBuddy.imageOnlyOpenAI')}
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="keywords" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {t('meetingDoodleBuddy.keywordsLabel')}
          </Label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('meetingDoodleBuddy.keywordsPlaceholder')}
            className={cn(
              "w-full min-h-[70px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={2}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {mode === 'idea' ? t('meetingDoodleBuddy.generatingIdea') : t('meetingDoodleBuddy.generatingImage')}
            </>
          ) : (
            <>{mode === 'idea' ? <><Lightbulb className="mr-2 h-4 w-4" /> {t('meetingDoodleBuddy.generateIdeaButton')}</> : <><ImageIcon className="mr-2 h-4 w-4" /> {t('meetingDoodleBuddy.generateImageButton')}</>}
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
            <CardTitle className="text-red-700 dark:text-red-400">{t('meetingDoodleBuddy.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !doodleIdea && !generatedImage && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 dark:text-teal-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {mode === 'idea' ? t('meetingDoodleBuddy.loadingIdeaMessage') : t('meetingDoodleBuddy.loadingImageMessage')}
          </p>
        </div>
      )}

      {doodleIdea && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-teal-700 dark:text-teal-400 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" /> {t('meetingDoodleBuddy.resultIdeaTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doodleIdea}</ReactMarkdown>
          </CardContent>
        </Card>
      )}

      {generatedImage && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col items-center justify-center shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 p-4"
        )}>
          <CardHeader>
            <CardTitle className="text-teal-700 dark:text-teal-400 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" /> {t('meetingDoodleBuddy.resultImageTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={generatedImage} alt={t('meetingDoodleBuddy.resultImageTitle')} className="max-w-full max-h-[400px] h-auto rounded-md object-contain" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingDoodleBuddy;
