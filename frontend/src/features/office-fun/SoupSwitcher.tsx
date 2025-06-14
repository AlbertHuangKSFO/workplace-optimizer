'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import React, { useCallback, useState } from 'react';

// Define types for quote and API response
interface Quote {
  text: string;
  type: 'chicken' | 'poisonous' | 'initial' | 'error';
}

const SoupSwitcher: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote>({
    text: '点击按钮，获取今日份"能量"汤！',
    type: 'initial',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getRandomQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const isChickenRequest = Math.random() < 0.5;
    const quoteTypeRequested = isChickenRequest ? 'chicken' : 'poisonous';

    let prompt = '';
    if (quoteTypeRequested === 'chicken') {
      prompt = '请给我一句充满正能量、富有哲理的鸡汤语录，20-40字左右，适合办公室打工人，风格可以幽默一些。语言：中文。';
    } else {
      prompt = '请给我一句非常幽默风趣、有点小讽刺但又不失智慧的毒鸡汤语录，20-40字左右，能让办公室打工人会心一笑的那种。语言：中文。';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          toolId: 'soup-switcher', // Important for backend to identify the tool
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'AI大厨今天可能心情不佳，暂时熬不出汤了。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setCurrentQuote({
          text: data.assistantMessage,
          type: quoteTypeRequested,
        });
      } else {
        console.warn('Unexpected API response structure for soup switcher:', data);
        throw new Error('AI返回的汤料有点奇怪，我暂时品不出来味道...');
      }
    } catch (e) {
      console.error('Failed to fetch soup quote:', e);
      const errorMessage = e instanceof Error ? e.message : '获取能量汤时发生未知错误，厨房可能着火了！🔥';
      setError(errorMessage);
      setCurrentQuote({
        text: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getQuoteTextColor = () => {
    switch (currentQuote.type) {
      case 'chicken':
        return 'text-green-600 dark:text-green-400';
      case 'poisonous':
        return 'text-red-600 dark:text-red-400';
      case 'error':
        return 'text-amber-600 dark:text-amber-400';
      case 'initial':
      default:
        return 'text-neutral-700 dark:text-neutral-300';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold flex items-center justify-center">
          <span role="img" aria-label="soup pot" className="mr-2 text-4xl">🍲</span>
          随机鸡汤/毒鸡汤
        </CardTitle>
        <CardDescription className="mt-1 text-base">
          AI为你特调，一碗下肚，精神抖擞（或更加清醒）。来，干了这碗！
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pt-6">
        <div className={cn(
            "min-h-[120px] p-4 rounded-md w-full flex items-center justify-center text-center",
            "bg-neutral-100 dark:bg-neutral-800",
             currentQuote.type === 'error' ? 'border-2 border-amber-500/50' : ''
           )}>
          {isLoading && currentQuote.type === 'initial' ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500 mb-2" />
              <p className="text-sky-600 dark:text-sky-400">AI大厨正在熬制中...</p>
            </div>
          ) : (
            <p className={`text-lg ${getQuoteTextColor()}`}>
              {currentQuote.text}
            </p>
          )}
        </div>

        {error && currentQuote.type !== 'error' && (
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button onClick={getRandomQuote} disabled={isLoading} size="lg" className="w-full sm:w-auto">
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> AI熬制中...
            </>
          ) : (
            <><RefreshCw className="mr-2 h-5 w-5" /> 换一碗尝尝
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SoupSwitcher;
