'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquareText, Wand2 } from 'lucide-react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const optimizationGoals = [
  { value: 'polite', label: '更礼貌客气' },
  { value: 'professional', label: '更专业正式' },
  { value: 'persuasive', label: '更有说服力' },
  { value: 'diplomatic', label: '更委婉外交' },
  { value: 'assertive', label: '更坚定有力' },
  { value: 'friendly', label: '更亲切友好' },
  { value: 'concise', label: '更简洁明了' },
  { value: 'emotional', label: '更有感染力' },
];

function SpeechOptimizer(): React.JSX.Element {
  const [originalText, setOriginalText] = useState<string>('');
  const [optimizationGoal, setOptimizationGoal] = useState<string>('professional');
  const [optimizedText, setOptimizedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!originalText.trim()) {
      setError('请输入需要优化的话术内容！');
      setOptimizedText('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOptimizedText('');

    const selectedGoal = optimizationGoals.find(g => g.value === optimizationGoal);
    const userPrompt = `请帮我优化以下话术，目标是让它${selectedGoal?.label}：\n\n${originalText}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'speech-optimizer',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '话术优化失败，可能是AI的修辞学课程还没上完。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setOptimizedText(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for speech optimization:', data);
        setError('AI返回的优化结果有点奇怪，我暂时理解不了...🤔');
      }
    } catch (e) {
      console.error('Failed to optimize speech:', e);
      setError(e instanceof Error ? e.message : '优化话术时发生未知错误，我的语言中枢短路了！💫');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <MessageSquareText className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">话术优化器</h1>
        <MessageSquareText className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="originalText" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            输入需要优化的话术内容：
          </Label>
          <Textarea
            id="originalText"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="例如：老板，我觉得这个方案不太行..."
            className={cn(
              "w-full min-h-[120px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={5}
          />
        </div>
        <div>
          <Label htmlFor="optimizationGoal" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            优化目标：
          </Label>
          <Select value={optimizationGoal} onValueChange={setOptimizationGoal}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder="选择优化方向..." />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {optimizationGoals.map(goal => (
                <SelectItem
                  key={goal.value}
                  value={goal.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AI正在精雕细琢...
            </>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> 开始优化话术！
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
            <CardTitle className="text-red-700 dark:text-red-400">优化失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !optimizedText && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">AI修辞大师正在为您的话术添加魔法...✨</p>
        </div>
      )}

      {optimizedText && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center">
              <Wand2 className="w-5 h-5 mr-2" /> 优化后的话术：
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedText}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SpeechOptimizer;
