'use client';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ValidLocale } from '@/lib/i18n';
import { useTranslations } from '@/lib/use-translations';
import { cn } from '@/lib/utils';
import { Loader2, Tags, Wand2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface NicknameGeneratorProps {
  locale: ValidLocale;
}

function NicknameGenerator({ locale }: NicknameGeneratorProps): React.JSX.Element {
  const { t, loading: translationsLoading } = useTranslations(locale);

  const [objectType, setObjectType] = useState<string>('');
  const [nameStyle, setNameStyle] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [negativeKeywords, setNegativeKeywords] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('5'); // Default to 5 names

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  // 使用useMemo来确保选项数组在翻译加载完成后才初始化
  const objectTypes = React.useMemo(() => [
    { value: 'project', label: t('nicknameGenerator.objectTypes.project') },
    { value: 'product', label: t('nicknameGenerator.objectTypes.product') },
    { value: 'team', label: t('nicknameGenerator.objectTypes.team') },
    { value: 'event', label: t('nicknameGenerator.objectTypes.event') },
    { value: 'pet', label: t('nicknameGenerator.objectTypes.pet') },
    { value: 'character', label: t('nicknameGenerator.objectTypes.character') },
    { value: 'company_feature', label: t('nicknameGenerator.objectTypes.company_feature') },
    { value: 'internal_tool', label: t('nicknameGenerator.objectTypes.internal_tool') },
    { value: 'community', label: t('nicknameGenerator.objectTypes.community') },
    { value: 'media_account', label: t('nicknameGenerator.objectTypes.media_account') },
  ], [t, translationsLoading]);

  const nameStyles = React.useMemo(() => [
    { value: 'professional', label: t('nicknameGenerator.nameStyles.professional') },
    { value: 'creative', label: t('nicknameGenerator.nameStyles.creative') },
    { value: 'modern', label: t('nicknameGenerator.nameStyles.modern') },
    { value: 'traditional', label: t('nicknameGenerator.nameStyles.traditional') },
    { value: 'playful', label: t('nicknameGenerator.nameStyles.playful') },
    { value: 'techy', label: t('nicknameGenerator.nameStyles.techy') },
    { value: 'elegant', label: t('nicknameGenerator.nameStyles.elegant') },
    { value: 'friendly', label: t('nicknameGenerator.nameStyles.friendly') },
    { value: 'powerful', label: t('nicknameGenerator.nameStyles.powerful') },
    { value: 'chinese_cultural', label: t('nicknameGenerator.nameStyles.chinese_cultural') },
  ], [t, translationsLoading]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult('');

    if (!objectType) {
      setError(t('nicknameGenerator.errorSelectObjectType'));
      setIsLoading(false);
      return;
    }

    // Get translated labels for the selected values
    const selectedObjectType = objectTypes.find(type => type.value === objectType)?.label || objectType;
    const selectedNameStyle = nameStyles.find(style => style.value === nameStyle)?.label || nameStyle;

    // Create prompt based on locale
    let userPrompt = '';
    if (locale === 'en-US') {
      userPrompt = `I need to create names/codenames for 【${selectedObjectType}】.`;
      if (nameStyle) userPrompt += ` The style should be 【${selectedNameStyle}】.`;
      if (description) userPrompt += ` Brief description or background: 【${description}】.`;
      if (keywords) userPrompt += ` The names should reflect these keywords or concepts: 【${keywords}】.`;
      if (negativeKeywords) userPrompt += ` Please avoid using or implying the following: 【${negativeKeywords}】.`;
      userPrompt += ` Please provide approximately ${quantity} suggestions.`;
    } else {
      userPrompt = `我需要为【${selectedObjectType}】起一些名称/代号。`;
      if (nameStyle) userPrompt += `风格偏向【${selectedNameStyle}】。`;
      if (description) userPrompt += `关于它的简要描述或背景是：【${description}】。`;
      if (keywords) userPrompt += `希望名称能体现以下关键词或概念：【${keywords}】。`;
      if (negativeKeywords) userPrompt += `请避免使用或暗示以下内容：【${negativeKeywords}】。`;
      userPrompt += `请提供大约 ${quantity} 个建议。`;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'nickname-generator',
          messages: [{ role: 'user', content: userPrompt }],
          language: locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `${locale === 'en-US' ? 'Request failed, status code:' : '请求失败，状态码：'} ${response.status}`);
      }

      const data = await response.json();
      setResult(data.assistantMessage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('nicknameGenerator.errorGeneration'));
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [objectType, nameStyle, keywords, description, negativeKeywords, quantity, locale, t, objectTypes, nameStyles]);

  // 如果翻译还在加载，显示加载器
  if (translationsLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full max-w-3xl mx-auto p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <CardHeader className="text-center pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
        <div className="flex items-center justify-center mb-3">
          <Tags className="w-10 h-10 text-purple-500 dark:text-purple-400" />
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
          {t('nicknameGenerator.title')}
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          {t('nicknameGenerator.description')}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-6 overflow-y-auto p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="objectType" className="block text-sm font-medium mb-1">
                {t('nicknameGenerator.objectTypeRequired')}
              </Label>
              <Select value={objectType} onValueChange={setObjectType}>
                <SelectTrigger id="objectType">
                  <SelectValue placeholder={t('nicknameGenerator.selectObjectType')} />
                </SelectTrigger>
                <SelectContent>
                  {objectTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nameStyle" className="block text-sm font-medium mb-1">
                {t('nicknameGenerator.nameStyle')}
              </Label>
              <Select value={nameStyle} onValueChange={setNameStyle}>
                <SelectTrigger id="nameStyle">
                  <SelectValue placeholder={t('nicknameGenerator.selectNameStyle')} />
                </SelectTrigger>
                <SelectContent>
                  {nameStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium mb-1">
              {t('nicknameGenerator.objectDescription')}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('nicknameGenerator.objectDescriptionPlaceholder')}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="keywords" className="block text-sm font-medium mb-1">
              {t('nicknameGenerator.keywords')}
            </Label>
            <Input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={t('nicknameGenerator.keywordsPlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="negativeKeywords" className="block text-sm font-medium mb-1">
              {t('nicknameGenerator.negativeKeywords')}
            </Label>
            <Input
              id="negativeKeywords"
              type="text"
              value={negativeKeywords}
              onChange={(e) => setNegativeKeywords(e.target.value)}
              placeholder={t('nicknameGenerator.negativeKeywordsPlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="quantity" className="block text-sm font-medium mb-1">
              {t('nicknameGenerator.quantity')}
            </Label>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger id="quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('nicknameGenerator.generating')}
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  {t('nicknameGenerator.generateNames')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setObjectType('');
                setNameStyle('');
                setKeywords('');
                setDescription('');
                setNegativeKeywords('');
                setQuantity('5');
                setResult('');
                setError(null);
              }}
              className="flex-1"
            >
              <Tags className="mr-2 h-4 w-4" />
              {t('nicknameGenerator.clearForm')}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </form>
      </CardContent>

      {result && (
        <CardFooter className="flex-shrink-0 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">
              {locale === 'en-US' ? 'Generated Names:' : '生成的名称：'}
            </h3>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-md max-h-64 overflow-y-auto">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-400" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 text-green-600 dark:text-green-400" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-purple-600 dark:text-purple-400" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default NicknameGenerator;
