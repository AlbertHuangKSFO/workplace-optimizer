'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Loader2, ShieldCheck, Wand2 } from 'lucide-react'; // Wand2 for generating magic advice
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const chillLevels = [
  { value: '1', label: '1 (随便穿穿，主打一个舒适至上) ' },
  { value: '2', label: '2 (需要见人，但不用太正式)' },
  { value: '3', label: '3 (普通上班，得体即可)' },
  { value: '4', label: '4 (有点重要，需要稍微讲究一下)' },
  { value: '5', label: '5 (重要场合，必须闪亮登场！✨)' },
];

function OfficeOutfitAdvisor(): React.JSX.Element {
  const [weather, setWeather] = useState<string>('');
  const [meetingContext, setMeetingContext] = useState<string>('');
  const [chillLevel, setChillLevel] = useState<string>('3');
  const [outfitAdvice, setOutfitAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setOutfitAdvice('');

    let userPrompt = '请根据以下情况，为我推荐今日职场穿搭：';
    if (weather.trim()) userPrompt += `\n- 天气：${weather}`;
    if (meetingContext.trim()) userPrompt += `\n- 会议/场合情况：${meetingContext}`;
    const selectedChillLevel = chillLevels.find(c => c.value === chillLevel);
    userPrompt += `\n- 我今天的"职场精致/躺平指数"是：${selectedChillLevel?.label || '未指定'}`;
    userPrompt += '\n请给出具体、实用且风趣的穿搭建议。';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          toolId: 'office-outfit-advisor',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '穿搭建议生成失败，时尚AI可能正在T台走秀。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setOutfitAdvice(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for outfit advice:', data);
        setError('AI返回的穿搭建议太潮了，我暂时跟不上...👠');
      }
    } catch (e) {
      console.error('Failed to fetch outfit advice:', e);
      setError(e instanceof Error ? e.message : '获取穿搭建议时发生未知错误，我的衣橱爆炸了！👚');
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
        <ShieldCheck className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600 dark:text-sky-400">"今天穿什么？"职场版</h1>
        <ShieldCheck className="w-8 h-8 text-cyan-600 dark:text-cyan-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <Label htmlFor="weather" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">今天天气如何？(选填)</Label>
          <Input
            type="text"
            id="weather"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="例如：晴朗，25度；阴雨绵绵；冷风飕飕..."
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
        <div>
          <Label htmlFor="meetingContext" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">有啥重要会议或场合吗？(选填)</Label>
          <Input
            type="text"
            id="meetingContext"
            value={meetingContext}
            onChange={(e) => setMeetingContext(e.target.value)}
            placeholder="例如：见客户；内部头脑风暴；普通搬砖日..."
            className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}
          />
        </div>
        <div>
          <Label htmlFor="chillLevel" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">今日"职场精致/躺平指数"？</Label>
          <Select value={chillLevel} onValueChange={setChillLevel}>
            <SelectTrigger className={cn(
              "w-full",
              "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700",
              "focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-500 dark:focus:border-sky-500"
            )}>
              <SelectValue placeholder="选择你的状态..." />
            </SelectTrigger>
            <SelectContent className={cn(
              "border-neutral-200 dark:border-neutral-700",
              "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            )}>
              {chillLevels.map(level => (
                <SelectItem
                  key={level.value}
                  value={level.value}
                  className={cn(
                    "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                    "focus:bg-sky-100 dark:focus:bg-sky-700"
                  )}
                >
                  {level.label}
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
            "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
          )}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 时尚顾问搭配中...
            </>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> 获取今日穿搭灵感！
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
            <CardTitle className="text-red-700 dark:text-red-400">穿搭建议获取失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-600 dark:text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !outfitAdvice && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 dark:text-cyan-400 mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">AI时尚顾问正在翻箱倒柜，寻找最佳搭配...👗</p>
        </div>
      )}

      {outfitAdvice && !isLoading && (
        <Card className={cn(
          "flex-grow flex flex-col shadow-inner",
          "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
        )}>
          <CardHeader>
            <CardTitle className="text-cyan-700 dark:text-cyan-400 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" /> 今日穿搭指南，请过目！
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words max-h-[600px] overflow-y-auto p-4 sm:p-6 text-neutral-800 dark:text-neutral-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{outfitAdvice}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OfficeOutfitAdvisor;
