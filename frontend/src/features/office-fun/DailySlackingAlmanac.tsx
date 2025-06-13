'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function DailySlackingAlmanac(): React.JSX.Element {
  const [almanacContent, setAlmanacContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAlmanac() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '生成今日的摸鱼黄历，包含宜做和忌做的事项。' }],
          toolId: 'daily-slacking-almanac',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '黄历生成失败，可能是天机不可泄露。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setAlmanacContent(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for almanac:', data);
        setError('AI返回的黄历格式有点奇怪，我暂时解读不了...📅');
      }
    } catch (e) {
      console.error('Failed to fetch almanac:', e);
      setError(e instanceof Error ? e.message : '获取黄历时发生未知错误，我的占卜水晶球碎了！🔮');
    } finally {
      setIsLoading(false);
    }
  }

  // 自动加载今日黄历
  useEffect(() => {
    fetchAlmanac();
  }, []);

  // 获取今日日期
  const today = new Date();
  const dateString = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <Calendar className="w-8 h-8 text-red-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">"今日宜摸鱼/忌加班"黄历</h1>
        <Calendar className="w-8 h-8 text-red-400 ml-2" />
      </div>

      <div className="text-center mb-6">
        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">📅 今日日期</h2>
          <p className="text-neutral-200 text-lg">{dateString}</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <Button
          onClick={fetchAlmanac}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 重新占卜...
            </>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" /> 刷新今日黄历
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">黄历加载失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !almanacContent && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-400 mb-4" />
          <p className="text-neutral-400">AI占卜大师正在观测天象，计算今日宜忌...🔮</p>
        </div>
      )}

      {almanacContent && (
        <Card className={`flex-grow flex flex-col shadow-inner transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-50' : 'opacity-100'} bg-neutral-800 border-neutral-700`}>
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <Calendar className="w-6 h-6 mr-2" /> 今日黄历指引：
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none break-words overflow-y-auto flex-grow p-6 leading-relaxed">
            <div className="text-left space-y-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{almanacContent}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DailySlackingAlmanac;
