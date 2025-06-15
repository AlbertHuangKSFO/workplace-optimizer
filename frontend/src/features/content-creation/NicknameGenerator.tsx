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
import { cn } from '@/lib/utils';
import { Loader2, Tags, Wand2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const objectTypes = [
  { value: 'project', label: '项目' },
  { value: 'product', label: '产品' },
  { value: 'team', label: '团队' },
  { value: 'event', label: '活动' },
  { value: 'pet', label: '宠物' },
  { value: 'character', label: '角色' },
  { value: 'company_feature', label: '公司特性/福利' },
  { value: 'internal_tool', label: '内部工具/系统' },
  { value: 'community', label: '社群/圈子' },
  { value: '公众号/自媒体', label: '公众号/自媒体账号' },
];

const nameStyles = [
  { value: 'professional', label: '专业稳重' },
  { value: 'creative', label: '创意独特' },
  { value: 'modern', label: '现代简约' },
  { value: 'traditional', label: '经典传统' },
  { value: 'playful', label: '活泼有趣' },
  { value: 'techy', label: '科技前沿' },
  { value: 'elegant', label: '优雅精致' },
  { value: 'friendly', label: '亲和友善' },
  { value: 'powerful', label: '霸气有力' },
  { value: 'chinese_cultural', label: '中国风' },
];

function NicknameGenerator(): React.JSX.Element {
  const [objectType, setObjectType] = useState<string>('');
  const [nameStyle, setNameStyle] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [negativeKeywords, setNegativeKeywords] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('5'); // Default to 5 names

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult('');

    if (!objectType) {
      setError('请选择对象类型');
      setIsLoading(false);
      return;
    }

    let userPrompt = `我需要为【${objectType}】起一些名称/代号。`;
    if (nameStyle) userPrompt += `风格偏向【${nameStyle}】。`;
    if (description) userPrompt += `关于它的简要描述或背景是：【${description}】。`;
    if (keywords) userPrompt += `希望名称能体现以下关键词或概念：【${keywords}】。`;
    if (negativeKeywords) userPrompt += `请避免使用或暗示以下内容：【${negativeKeywords}】。`;
    userPrompt += `请提供大约 ${quantity} 个建议。`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'nickname-generator',
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `请求失败，状态码：${response.status}`);
      }

      const data = await response.json();
      setResult(data.assistantMessage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('生成过程中发生未知错误');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [objectType, nameStyle, keywords, description, negativeKeywords, quantity]);

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
          智能起名/代号生成器
        </CardTitle>
        <CardDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-4">
          根据您的需求，快速生成创意名称、项目代号、宠物昵称等。
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-6 overflow-y-auto p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="objectType" className="block text-sm font-medium mb-1">对象类型 <span className="text-red-500">*</span></Label>
              <Select value={objectType} onValueChange={setObjectType}>
                <SelectTrigger id="objectType">
                  <SelectValue placeholder="选择对象类型" />
                </SelectTrigger>
                <SelectContent>
                  {objectTypes.map(type => (
                    <SelectItem key={type.value} value={type.label}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nameStyle" className="block text-sm font-medium mb-1">期望风格</Label>
              <Select value={nameStyle} onValueChange={setNameStyle}>
                <SelectTrigger id="nameStyle">
                  <SelectValue placeholder="选择期望风格 (可选)" />
                </SelectTrigger>
                <SelectContent>
                  {nameStyles.map(style => (
                    <SelectItem key={style.value} value={style.label}>{style.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium mb-1">
              对象简述 (可选)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：一个帮助提高团队协作效率的内部工具..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="keywords" className="block text-sm font-medium mb-1">
              包含关键词/核心概念 (可选)
            </Label>
            <Input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例如：创新, 智能, 连接, 未来 (用逗号分隔)"
            />
          </div>

          <div>
            <Label htmlFor="negativeKeywords" className="block text-sm font-medium mb-1">
              排除词/避免的含义 (可选)
            </Label>
            <Input
              id="negativeKeywords"
              type="text"
              value={negativeKeywords}
              onChange={(e) => setNegativeKeywords(e.target.value)}
              placeholder="例如：旧的, 复杂的, 负面的 (用逗号分隔)"
            />
          </div>

          <div>
            <Label htmlFor="quantity" className="block text-sm font-medium mb-1">建议数量</Label>
            <Select value={quantity} onValueChange={setQuantity}>
                <SelectTrigger id="quantity" className="w-[180px]">
                  <SelectValue placeholder="选择数量" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 8, 10, 15].map(num => (
                    <SelectItem key={num} value={String(num)}>{num}个</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <Button type="submit" className="w-full text-base py-3" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isLoading ? '生成中...' : '开始智能生成'}
          </Button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">
            <p className="font-semibold">发生错误</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">生成结果：</h3>
            <div className="prose prose-sm sm:prose dark:prose-invert max-w-none p-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
       <CardFooter className="text-xs text-center text-neutral-500 dark:text-neutral-400 pt-4 mt-auto border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
        AI 生成内容仅供参考，请仔细甄别。
      </CardFooter>
    </Card>
  );
}

export default NicknameGenerator;
