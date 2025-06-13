import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Gamepad2, Loader2, Shirt } from 'lucide-react'; // Gamepad2 for generating the game
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Meeting BINGO Generator
function MeetingBingoGenerator(): React.JSX.Element {
  const [bingoTheme, setBingoTheme] = useState<string>('');
  const [bingoCard, setBingoCard] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setBingoCard('');

    const userMessage = bingoTheme.trim()
      ? `请围绕这些主题或关键词生成会议BINGO卡片：${bingoTheme}`
      : '帮我生成一张通用的会议BINGO卡片，包含常见的会议废话！';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          toolId: 'meeting-bingo-generator',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'BINGO卡片生成失败，可能是会议词汇量不足。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setBingoCard(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for BINGO card:', data);
        setError('AI返回的BINGO卡片格式太新潮，我暂时无法展示...🎲');
      }
    } catch (e) {
      console.error('Failed to fetch BINGO card:', e);
      setError(e instanceof Error ? e.message : '生成BINGO卡片时发生未知错误，游戏服务器可能正在维护！🛠️');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <Shirt className="w-8 h-8 text-indigo-400 mr-2" />
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">"会议BINGO"卡片生成器</h1>
        <Shirt className="w-8 h-8 text-indigo-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="bingoTheme" className="block text-sm font-medium text-neutral-300 mb-2">
            输入会议主题、常见"黑话"或留空获取通用BINGO卡 (选填)
          </label>
          <Textarea
            id="bingoTheme"
            value={bingoTheme}
            onChange={(e) => setBingoTheme(e.target.value)}
            placeholder="例如：赋能、闭环、抓手、对齐一下、颗粒度、打法..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[70px]"
            rows={2}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> BINGO卡片印刷中...
            </>
          ) : (
            <><Gamepad2 className="mr-2 h-4 w-4" /> 生成BINGO卡，开玩！
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">BINGO卡生成失败！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !bingoCard && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mb-4" />
          <p className="text-neutral-400">AI正在搜罗会议金句，制作BINGO卡片...🃏</p>
        </div>
      )}

      {bingoCard && !isLoading && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-indigo-400 flex items-center">
              <Shirt className="w-5 h-5 mr-2" /> 您的会议BINGO卡已就绪！
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow p-4 sm:p-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bingoCard}</ReactMarkdown>
            <p className="text-xs text-neutral-500 mt-4 italic">
              小提示：实际游戏中，您可以将这些词条填入一个 5x5 的表格中，中间格子为 FREE。祝您游戏愉快！
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingBingoGenerator;
