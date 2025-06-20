'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { CircleDot, Compass, Eye, Sparkles, Zap } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FengshuiOption {
  id: string;
  labelKey: string;
  emoji: string;
  descKey: string;
}

interface Props {
  locale: ValidLocale;
}

export default function OfficeFengshuiDetector({ locale }: Props) {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const workstationLayouts: FengshuiOption[] = [
    { id: 'wall-back', labelKey: 'workstationLayout.wallBack', emoji: '🧱', descKey: 'workstationLayout.wallBackDesc' },
    { id: 'aisle-back', labelKey: 'workstationLayout.aisleBack', emoji: '🚶‍♂️', descKey: 'workstationLayout.aisleBackDesc' },
    { id: 'window-back', labelKey: 'workstationLayout.windowBack', emoji: '🪟', descKey: 'workstationLayout.windowBackDesc' },
    { id: 'corner', labelKey: 'workstationLayout.corner', emoji: '📐', descKey: 'workstationLayout.cornerDesc' }
  ];

  const monitorDirections: FengshuiOption[] = [
    { id: 'north', labelKey: 'monitorDirection.north', emoji: '🧭', descKey: 'monitorDirection.northDesc' },
    { id: 'south', labelKey: 'monitorDirection.south', emoji: '☀️', descKey: 'monitorDirection.southDesc' },
    { id: 'east', labelKey: 'monitorDirection.east', emoji: '🌅', descKey: 'monitorDirection.eastDesc' },
    { id: 'west', labelKey: 'monitorDirection.west', emoji: '🌅', descKey: 'monitorDirection.westDesc' },
    { id: 'unknown', labelKey: 'monitorDirection.unknown', emoji: '❓', descKey: 'monitorDirection.unknownDesc' }
  ];

  const deskItems: FengshuiOption[] = [
    { id: 'plant', labelKey: 'deskItems.plant', emoji: '🪴', descKey: 'deskItems.plantDesc' },
    { id: 'coffee', labelKey: 'deskItems.coffee', emoji: '☕', descKey: 'deskItems.coffeeDesc' },
    { id: 'figurine', labelKey: 'deskItems.figurine', emoji: '🎎', descKey: 'deskItems.figurineDesc' },
    { id: 'books', labelKey: 'deskItems.books', emoji: '📚', descKey: 'deskItems.booksDesc' },
    { id: 'snacks', labelKey: 'deskItems.snacks', emoji: '🍪', descKey: 'deskItems.snacksDesc' },
    { id: 'mirror', labelKey: 'deskItems.mirror', emoji: '🪞', descKey: 'deskItems.mirrorDesc' }
  ];

  const [layout, setLayout] = useState<string>('');
  const [direction, setDirection] = useState<string>('');
  const [items, setItems] = useState<string[]>([]);
  const [problems, setProblems] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleItemToggle = (itemId: string) => {
    setItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (!layout || !direction) {
      setError(t('officeFengshuiDetector.errors.missingRequired'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const layoutInfo = workstationLayouts.find(l => l.id === layout);
      const directionInfo = monitorDirections.find(d => d.id === direction);
      const selectedItems = items.map(id => deskItems.find(item => item.id === id)).filter(Boolean);

      const userInput = `
Workstation Analysis:
- Layout: ${layoutInfo?.emoji} ${t(`officeFengshuiDetector.${layoutInfo?.labelKey}`)} (${t(`officeFengshuiDetector.${layoutInfo?.descKey}`)})
- Monitor Direction: ${directionInfo?.emoji} ${t(`officeFengshuiDetector.${directionInfo?.labelKey}`)} (${t(`officeFengshuiDetector.${directionInfo?.descKey}`)})
- Desk Items: ${selectedItems.map(item => `${item?.emoji} ${t(`officeFengshuiDetector.${item?.labelKey}`)}`).join(', ') || 'None'}

${problems ? `Issues: ${problems}` : ''}

Please analyze the feng shui of my workstation and provide fortune-enhancing suggestions!
      `.trim();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          toolId: 'office-fengshui-detector',
          language: locale
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.assistantMessage || t('officeFengshuiDetector.errors.analysisFailed'));
    } catch (err: any) {
      console.error('Feng shui analysis failed:', err);
      setError(`${t('officeFengshuiDetector.errors.analysisFailed')}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLayout('');
    setDirection('');
    setItems([]);
    setProblems('');
    setResult('');
    setError('');
  };

  const getCompletionRate = () => {
    let completed = 0;
    if (layout) completed += 40;
    if (direction) completed += 40;
    if (items.length > 0) completed += 10;
    if (problems.trim()) completed += 10;
    return completed;
  };

  if (translationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "max-w-4xl mx-auto p-6 space-y-6",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
      )}>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Compass className="w-8 h-8 text-purple-600 dark:text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 bg-clip-text text-transparent">
            {t('officeFengshuiDetector.title')}
          </h1>
          <CircleDot className="w-8 h-8 text-purple-600 dark:text-purple-500" />
        </div>
        <p className="text-neutral-600 dark:text-muted-foreground max-w-2xl mx-auto">
          {t('officeFengshuiDetector.description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className={cn(
            "flex items-center gap-1",
            "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            )}>
            <Eye className="w-4 h-4" />
            {t('officeFengshuiDetector.completionRate')}: {getCompletionRate()}%
          </Badge>
          <Badge variant="outline" className={cn(
            "flex items-center gap-1",
            "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            )}>
            <Sparkles className="w-4 h-4" />
            {t('officeFengshuiDetector.mysticAnalysis')}
          </Badge>
        </div>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-700"/>

      {!result ? (
        <div className="space-y-6">
          {/* 工位布局 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  1
                </span>
                {t('officeFengshuiDetector.workstationLayout.title')}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                {t('officeFengshuiDetector.workstationLayout.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workstationLayouts.map((option) => (
                  <Button
                    key={option.id}
                    variant={layout === option.id ? "default" : "outline"}
                    className={cn(
                      "h-auto p-4 text-left justify-start",
                      layout === option.id ?
                        "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" :
                        "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
                    )}
                    onClick={() => setLayout(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{t(`officeFengshuiDetector.${option.labelKey}`)}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{t(`officeFengshuiDetector.${option.descKey}`)}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 显示器朝向 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  2
                </span>
                {t('officeFengshuiDetector.monitorDirection.title')}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                {t('officeFengshuiDetector.monitorDirection.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {monitorDirections.map((option) => (
                  <Button
                    key={option.id}
                    variant={direction === option.id ? "default" : "outline"}
                    className={cn(
                      "h-auto p-4 text-left justify-start",
                      direction === option.id ?
                        "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" :
                        "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
                    )}
                    onClick={() => setDirection(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{t(`officeFengshuiDetector.${option.labelKey}`)}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{t(`officeFengshuiDetector.${option.descKey}`)}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 桌面物品 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  3
                </span>
                {t('officeFengshuiDetector.deskItems.title')}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                {t('officeFengshuiDetector.deskItems.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {deskItems.map((option) => (
                  <Button
                    key={option.id}
                    variant={items.includes(option.id) ? "default" : "outline"}
                    className={cn(
                      "h-auto p-4 text-left justify-start",
                      items.includes(option.id) ?
                        "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600" :
                        "bg-white dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
                    )}
                    onClick={() => handleItemToggle(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{t(`officeFengshuiDetector.${option.labelKey}`)}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{t(`officeFengshuiDetector.${option.descKey}`)}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 遇到的问题 */}
          <Card className={cn(
            "border-2 hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
            "bg-neutral-50 dark:bg-neutral-800/30 border-neutral-200 dark:border-neutral-700"
            )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-neutral-800 dark:text-neutral-200">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  4
                </span>
                {t('officeFengshuiDetector.problems.title')}
              </CardTitle>
              <CardDescription className="text-neutral-600 dark:text-neutral-400">
                {t('officeFengshuiDetector.problems.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                placeholder={t('officeFengshuiDetector.problems.placeholder')}
                className={cn(
                  "min-h-[100px]",
                  "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600",
                  "focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-500 dark:focus:border-purple-500"
                  )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || (!layout || !direction)}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <Zap className="w-5 h-5 mr-2 animate-ping" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isLoading ? t('officeFengshuiDetector.buttons.analyzing') : t('officeFengshuiDetector.buttons.analyze')}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className={cn(
                "w-full sm:w-auto",
                "border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                )}
            >
              {t('officeFengshuiDetector.buttons.reset')}
            </Button>
          </div>
        </div>
      ) : (
        <Card className={cn(
          "border-2 border-purple-300 dark:border-purple-600 shadow-xl",
          "bg-neutral-50 dark:bg-neutral-800/50"
          )}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500">
              {t('officeFengshuiDetector.result.title')}
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-400">
              {t('officeFengshuiDetector.result.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button onClick={handleReset} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              {t('officeFengshuiDetector.buttons.testAgain')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
