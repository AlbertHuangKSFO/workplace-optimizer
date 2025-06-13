'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { ChefHat, Loader2, Wand2 } from 'lucide-react'; // Wand2 for generating magic excuses
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Universal Excuse Generator
function UniversalExcuseGenerator(): React.JSX.Element {
  const [excuseScenario, setExcuseScenario] = useState<string>('');
  const [generatedExcuse, setGeneratedExcuse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!excuseScenario.trim()) {
      setError('请描述一下你需要借口的场景，我好对症下药！👨‍🍳');
      setGeneratedExcuse('');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedExcuse('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: excuseScenario }],
          toolId: 'universal-excuse-generator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '借口生成失败，可能是我的灵感枯竭了。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setGeneratedExcuse(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for excuse:', data);
        setError('AI返回的借口有点不按套路出牌，我先缓缓...🤔');
      }
    } catch (e) {
      console.error('Failed to fetch excuse:', e);
      setError(e instanceof Error ? e.message : '生成借口时发生未知错误，我的借口宝典可能被施了魔法！🪄');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn(
      "p-4 sm:p-6 rounded-lg shadow-xl h-full flex flex-col",
      "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
    )}>
      <div className="flex items-center justify-center mb-6 text-center">
        <ChefHat className="w-8 h-8 text-orange-500 dark:text-orange-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">"万能借口"生成器</h1>
        <ChefHat className="w-8 h-8 text-orange-500 dark:text-orange-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="excuseScenario" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            遇到啥窘境了？详细说说，AI大厨为你烹饪完美借口！🍲
          </label>
          <Textarea
            id="excuseScenario"
            value={excuseScenario}
            onChange={(e) => setExcuseScenario(e.target.value)}
            placeholder="例如：\n- 明早的会不想去了\n- Deadline到了但活儿还没干完\n- 不小心把老板的咖啡打翻了..."
            className={cn(
              "w-full min-h-[100px]",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
            rows={4}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full text-white",
            "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 借口正在精心炮制中...
            </>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> 生成完美借口！
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
            <CardTitle className="text-red-700 dark:text-red-400">借口生成失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !generatedExcuse && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 dark:text-orange-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">AI借口大师正在搜肠刮肚，寻找最天衣无缝的理由...🤔</p>
        </div>
      )}

      {generatedExcuse && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center">
              <ChefHat className="w-5 h-5 mr-2" /> 您的专属万能借口已送达！
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedExcuse}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UniversalExcuseGenerator;
