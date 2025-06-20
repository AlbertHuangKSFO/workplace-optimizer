'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface DrinkItem {
  name: string;
  amount: string;
  time: string;
}

interface CaffeineDependencyIndexProps {
  locale: ValidLocale;
}

export default function CaffeineDependencyIndex({ locale }: CaffeineDependencyIndexProps) {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [drinks, setDrinks] = useState<DrinkItem[]>([{ name: '', amount: '', time: '' }]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addDrink = () => {
    setDrinks([...drinks, { name: '', amount: '', time: '' }]);
  };

  const removeDrink = (index: number) => {
    if (drinks.length > 1) {
      setDrinks(drinks.filter((_, i) => i !== index));
    }
  };

  const updateDrink = (index: number, field: keyof DrinkItem, value: string) => {
    const newDrinks = [...drinks];
    newDrinks[index][field] = value;
    setDrinks(newDrinks);
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const consumptionDetails = drinks
        .filter(drink => drink.name.trim())
        .map(drink => `${drink.name}${drink.amount ? ` (${drink.amount})` : ''}${drink.time ? ` - ${drink.time}` : ''}`)
        .join('\n');

      if (!consumptionDetails.trim()) {
        alert(t('caffeineDependencyIndex.emptyDrinkAlert'));
        return;
      }

      // Create prompt based on locale
      const prompt = locale === 'en-US'
        ? `Please help me analyze my caffeine dependency index.

My drink consumption:
${consumptionDetails}

Additional information: ${additionalInfo || 'No additional information'}`
        : `请帮我分析一下咖啡因依赖指数。

我的饮品消费情况：
${consumptionDetails}

补充信息：${additionalInfo || '无其他信息'}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'caffeine-dependency-index',
          locale: locale,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(t('caffeineDependencyIndex.analysisError'));
      }

      const data = await response.json();
      setResult(data.assistantMessage);
    } catch (error) {
      console.error('Error:', error);
      setResult(t('caffeineDependencyIndex.generalError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if translations are still loading
  if (translationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('caffeineDependencyIndex.title')}</h1>
        <p className="text-muted-foreground">
          {t('caffeineDependencyIndex.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('caffeineDependencyIndex.drinkRecordTitle')}</CardTitle>
            <CardDescription>
              {t('caffeineDependencyIndex.drinkRecordDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {drinks.map((drink, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">{t('caffeineDependencyIndex.drinkLabel')} {index + 1}</Label>
                  {drinks.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDrink(index)}
                    >
                      {t('caffeineDependencyIndex.deleteButton')}
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  <Input
                    placeholder={t('caffeineDependencyIndex.drinkNamePlaceholder')}
                    value={drink.name}
                    onChange={(e) => updateDrink(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder={t('caffeineDependencyIndex.amountPlaceholder')}
                    value={drink.amount}
                    onChange={(e) => updateDrink(index, 'amount', e.target.value)}
                  />
                  <Input
                    placeholder={t('caffeineDependencyIndex.timePlaceholder')}
                    value={drink.time}
                    onChange={(e) => updateDrink(index, 'time', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addDrink} className="w-full">
              {t('caffeineDependencyIndex.addDrinkButton')}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="additional-info">{t('caffeineDependencyIndex.additionalInfoLabel')}</Label>
              <Textarea
                id="additional-info"
                placeholder={t('caffeineDependencyIndex.additionalInfoPlaceholder')}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('caffeineDependencyIndex.analyzing')}
                </>
              ) : (
                t('caffeineDependencyIndex.analyzeButton')
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('caffeineDependencyIndex.resultTitle')}</CardTitle>
            <CardDescription>
              {t('caffeineDependencyIndex.resultDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-4">☕</div>
                <p>{t('caffeineDependencyIndex.emptyStateText')}</p>
                <div className="mt-4 text-xs space-y-1">
                  <p>{t('caffeineDependencyIndex.referenceTitle')}</p>
                  <p>{t('caffeineDependencyIndex.americanoCaffeine')}</p>
                  <p>{t('caffeineDependencyIndex.milkTeaCaffeine')}</p>
                  <p>{t('caffeineDependencyIndex.redbullCaffeine')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
