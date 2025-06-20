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
import { Image as ImageIcon, Loader2, Smile, Zap } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  locale: ValidLocale;
}

function WorkplaceMemeGenerator({ locale }: Props): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [memeCategory, setMemeCategory] = useState<string>('meeting-humor');
  const [memeStyle, setMemeStyle] = useState<string>('classic-template');
  const [humorLevel, setHumorLevel] = useState<string>('mild');
  const [situation, setSituation] = useState<string>('');
  const [characters, setCharacters] = useState<string>('');
  const [specificDetails, setSpecificDetails] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [generatedMeme, setGeneratedMeme] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get translated category, style, and humor level data
  const memeCategories = [
    { value: 'meeting-humor', label: t('workplaceMemeGenerator.categories.meeting-humor.label'), emoji: '😂', description: t('workplaceMemeGenerator.categories.meeting-humor.description') },
    { value: 'deadline-stress', label: t('workplaceMemeGenerator.categories.deadline-stress.label'), emoji: '😰', description: t('workplaceMemeGenerator.categories.deadline-stress.description') },
    { value: 'boss-interaction', label: t('workplaceMemeGenerator.categories.boss-interaction.label'), emoji: '👔', description: t('workplaceMemeGenerator.categories.boss-interaction.description') },
    { value: 'overtime-life', label: t('workplaceMemeGenerator.categories.overtime-life.label'), emoji: '🌙', description: t('workplaceMemeGenerator.categories.overtime-life.description') },
    { value: 'code-debugging', label: t('workplaceMemeGenerator.categories.code-debugging.label'), emoji: '🐛', description: t('workplaceMemeGenerator.categories.code-debugging.description') },
    { value: 'office-politics', label: t('workplaceMemeGenerator.categories.office-politics.label'), emoji: '🎭', description: t('workplaceMemeGenerator.categories.office-politics.description') },
    { value: 'work-from-home', label: t('workplaceMemeGenerator.categories.work-from-home.label'), emoji: '🏠', description: t('workplaceMemeGenerator.categories.work-from-home.description') },
    { value: 'salary-dreams', label: t('workplaceMemeGenerator.categories.salary-dreams.label'), emoji: '💰', description: t('workplaceMemeGenerator.categories.salary-dreams.description') },
  ];

  const memeStyles = [
    { value: 'classic-template', label: t('workplaceMemeGenerator.styles.classic-template.label'), emoji: '🖼️', description: t('workplaceMemeGenerator.styles.classic-template.description') },
    { value: 'text-based', label: t('workplaceMemeGenerator.styles.text-based.label'), emoji: '📝', description: t('workplaceMemeGenerator.styles.text-based.description') },
    { value: 'dialogue', label: t('workplaceMemeGenerator.styles.dialogue.label'), emoji: '💬', description: t('workplaceMemeGenerator.styles.dialogue.description') },
    { value: 'comparison', label: t('workplaceMemeGenerator.styles.comparison.label'), emoji: '⚖️', description: t('workplaceMemeGenerator.styles.comparison.description') },
    { value: 'progression', label: t('workplaceMemeGenerator.styles.progression.label'), emoji: '📈', description: t('workplaceMemeGenerator.styles.progression.description') },
    { value: 'reaction', label: t('workplaceMemeGenerator.styles.reaction.label'), emoji: '😱', description: t('workplaceMemeGenerator.styles.reaction.description') },
  ];

  const humorLevels = [
    { value: 'mild', label: t('workplaceMemeGenerator.humorLevels.mild.label'), emoji: '😊', description: t('workplaceMemeGenerator.humorLevels.mild.description') },
    { value: 'sarcastic', label: t('workplaceMemeGenerator.humorLevels.sarcastic.label'), emoji: '😏', description: t('workplaceMemeGenerator.humorLevels.sarcastic.description') },
    { value: 'self-deprecating', label: t('workplaceMemeGenerator.humorLevels.self-deprecating.label'), emoji: '🤷', description: t('workplaceMemeGenerator.humorLevels.self-deprecating.description') },
    { value: 'absurd', label: t('workplaceMemeGenerator.humorLevels.absurd.label'), emoji: '🤪', description: t('workplaceMemeGenerator.humorLevels.absurd.description') },
    { value: 'relatable', label: t('workplaceMemeGenerator.humorLevels.relatable.label'), emoji: '🎯', description: t('workplaceMemeGenerator.humorLevels.relatable.description') },
  ];

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!situation.trim()) {
      setError(t('workplaceMemeGenerator.errorValidation'));
      setGeneratedMeme('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedMeme('');
    setGeneratedImage('');

    const selectedCategory = memeCategories.find(c => c.value === memeCategory);
    const selectedStyle = memeStyles.find(s => s.value === memeStyle);
    const selectedHumor = humorLevels.find(h => h.value === humorLevel);

    if (mode === 'text') {
      // Generate text meme
      const userPrompt = `
梗图类别：${selectedCategory?.label} - ${selectedCategory?.description}
梗图风格：${selectedStyle?.label} - ${selectedStyle?.description}
幽默程度：${selectedHumor?.label} - ${selectedHumor?.description}

情况描述：
${situation}

${characters.trim() ? `涉及角色：${characters}` : ''}
${specificDetails.trim() ? `具体细节：${specificDetails}` : ''}
${targetAudience.trim() ? `目标受众：${targetAudience}` : ''}

请创作一个有趣的职场梗图内容，包括文案、对话或者梗图描述。要求幽默有趣，能引起职场人的共鸣。
`;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: userPrompt }],
            toolId: 'workplace-meme-generator',
            locale: locale,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: t('workplaceMemeGenerator.errorTitle') }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.assistantMessage) {
          setGeneratedMeme(data.assistantMessage);
        } else {
          console.warn('Unexpected API response structure:', data);
          setError(t('workplaceMemeGenerator.errorTitle'));
        }
      } catch (e) {
        console.error('Failed to generate meme:', e);
        setError(e instanceof Error ? e.message : t('workplaceMemeGenerator.errorTitle'));
      }
    } else {
      // Generate image meme
      const imagePrompt = `
Create a funny workplace meme image about: ${situation}
Category: ${selectedCategory?.label}
Style: ${selectedStyle?.label}
Characters: ${characters || 'office workers'}
Humor level: ${selectedHumor?.label}
${specificDetails ? `Details: ${specificDetails}` : ''}

Create a humorous, relatable workplace scenario that would make office workers laugh and think "that's so true!" The image should be professional but funny.
`;

      try {
        const response = await fetch('/api/image/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'meme'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: t('workplaceMemeGenerator.errorTitle') }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.imageUrl) {
          setGeneratedImage(data.imageUrl);
        } else {
          console.warn('Unexpected API response structure for image generation:', data);
          setError(t('workplaceMemeGenerator.errorTitle'));
        }
      } catch (e) {
        console.error('Failed to generate meme image:', e);
        setError(e instanceof Error ? e.message : t('workplaceMemeGenerator.errorTitle'));
      }
    }

    setIsLoading(false);
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <ImageIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">{t('workplaceMemeGenerator.title')}</h1>
        <Smile className="w-8 h-8 text-yellow-500 dark:text-yellow-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="mode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.modeLabel')}
            </Label>
            <Select value={mode} onValueChange={(value: 'text' | 'image') => setMode(value)}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder={t('workplaceMemeGenerator.modeLabel')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                <SelectItem
                  value="text"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                    "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                  )}
                >
                  📝 {t('workplaceMemeGenerator.textMode')}
                </SelectItem>
                <SelectItem
                  value="image"
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                    "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                  )}
                >
                  <div className="flex flex-col">
                    <span>🎨 {t('workplaceMemeGenerator.imageMode')}</span>
                    <span className="text-xs text-orange-600 dark:text-orange-400"> {t('workplaceMemeGenerator.imageModeHint')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memeCategory" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.categoryLabel')}
            </Label>
            <Select value={memeCategory} onValueChange={setMemeCategory}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder={t('workplaceMemeGenerator.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {memeCategories.map(category => (
                  <SelectItem
                    key={category.value}
                    value={category.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{category.emoji} {category.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{category.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="memeStyle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.styleLabel')}
            </Label>
            <Select value={memeStyle} onValueChange={setMemeStyle}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder={t('workplaceMemeGenerator.stylePlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {memeStyles.map(style => (
                  <SelectItem
                    key={style.value}
                    value={style.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{style.emoji} {style.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{style.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="humorLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.humorLabel')}
            </Label>
            <Select value={humorLevel} onValueChange={setHumorLevel}>
              <SelectTrigger className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}>
                <SelectValue placeholder={t('workplaceMemeGenerator.humorPlaceholder')} />
              </SelectTrigger>
              <SelectContent className={cn(
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              )}>
                {humorLevels.map(level => (
                  <SelectItem
                    key={level.value}
                    value={level.value}
                    className={cn(
                      "hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-yellow-100 dark:focus:bg-yellow-700/50",
                      "data-[state=checked]:bg-yellow-200 dark:data-[state=checked]:bg-yellow-600/50"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{level.emoji} {level.label}</span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="situation" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {t('workplaceMemeGenerator.situationLabel')}
          </Label>
          <Textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={t('workplaceMemeGenerator.situationPlaceholder')}
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            )}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="characters" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.charactersLabel')}
            </Label>
            <Input
              id="characters"
              value={characters}
              onChange={(e) => setCharacters(e.target.value)}
              placeholder={t('workplaceMemeGenerator.charactersPlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="specificDetails" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.detailsLabel')}
            </Label>
            <Input
              id="specificDetails"
              value={specificDetails}
              onChange={(e) => setSpecificDetails(e.target.value)}
              placeholder={t('workplaceMemeGenerator.detailsPlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}
            />
          </div>
          <div>
            <Label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {t('workplaceMemeGenerator.audienceLabel')}
            </Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder={t('workplaceMemeGenerator.audiencePlaceholder')}
              className={cn(
                "w-full",
                "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
                "focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
              )}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full font-semibold",
            "bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:text-neutral-900",
            "disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 dark:disabled:text-neutral-400"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('workplaceMemeGenerator.generating')}</>
          ) : (
            <><Zap className="mr-2 h-4 w-4" /> {t('workplaceMemeGenerator.generateButton')}</>
          )}
        </Button>
      </form>

      {/* Wrapper for the entire results/status section */}
      <div className={cn(
        "flex-grow mt-4 flex flex-col",
        "bg-white"
      )}>
        {error && (
          <Card className={cn(
            "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-900/30",
            "flex-grow flex flex-col"
          )}>
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">{t('workplaceMemeGenerator.errorTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="text-red-600 dark:text-red-300 flex-grow">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {!error && isLoading && !generatedMeme && !generatedImage && (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500 dark:text-yellow-400 mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">{t('workplaceMemeGenerator.loadingText')}</p>
          </div>
        )}

        {!error && !isLoading && generatedMeme && mode === 'text' && (
          <Card className={cn(
            "flex-grow flex flex-col shadow-inner",
            "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
          )}>
            <CardHeader>
              <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
                <Smile className="w-5 h-5 mr-2" /> {t('workplaceMemeGenerator.resultTextTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedMeme}</ReactMarkdown>
            </CardContent>
          </Card>
        )}

        {!error && !isLoading && generatedImage && mode === 'image' && (
          <div className={cn(
            "flex-grow flex flex-col items-center justify-center p-4 rounded-lg shadow-inner",
            "bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          )}>
            <CardHeader className="pb-2 pt-0">
              <CardTitle className="text-yellow-600 dark:text-yellow-400 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" /> {t('workplaceMemeGenerator.resultImageTitle')}
              </CardTitle>
            </CardHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImage}
              alt="Generated Meme"
              className="max-w-full max-h-[calc(100vh-450px)] object-contain rounded-md shadow-md bg-neutral-200 dark:bg-neutral-700"
              onError={() => setError(t('workplaceMemeGenerator.errorImageLoad'))}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{t('workplaceMemeGenerator.imageCaption')}</p>
          </div>
        )}

        {/* Fallback for initial empty state */}
        {!error && !isLoading && !generatedMeme && !generatedImage && (
           <div className={cn(
            "flex-grow flex flex-col items-center justify-center p-6 rounded-lg",
            "bg-neutral-50 border border-dashed border-neutral-300 dark:border-neutral-600"
          )}>
            <ImageIcon size={48} className="text-neutral-400 dark:text-neutral-500 mb-3" />
            <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 whitespace-pre-line">
              {t('workplaceMemeGenerator.emptyStateText')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkplaceMemeGenerator;
