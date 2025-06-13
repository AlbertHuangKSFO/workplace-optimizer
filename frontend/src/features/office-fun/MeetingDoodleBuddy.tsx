import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2, Palette, Quote } from 'lucide-react'; // Palette or Lightbulb for ideas
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// TODO: Implement the actual UI and logic for Meeting Doodle Buddy
function MeetingDoodleBuddy(): React.JSX.Element {
  const [keywords, setKeywords] = useState<string>('');
  const [doodleIdea, setDoodleIdea] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setDoodleIdea('');

    const userMessage = keywords.trim()
      ? `帮我把这些会议关键词变成涂鸦灵感：${keywords}`
      : '会议好无聊，快给我点涂鸦灵感！';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          toolId: 'meeting-doodle-buddy',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '涂鸦灵感生成失败，可能是我的画笔没墨了。' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.assistantMessage) {
        setDoodleIdea(data.assistantMessage);
      } else {
        console.warn('Unexpected API response structure for doodle idea:', data);
        setError('AI返回的灵感太抽象了，我暂时画不出来...🎨');
      }
    } catch (e) {
      console.error('Failed to fetch doodle idea:', e);
      setError(e instanceof Error ? e.message : '获取涂鸦灵感时发生未知错误，我的缪斯女神休假了！🏖️');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-neutral-900 text-neutral-100 rounded-lg shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-center mb-6 text-center">
        <Quote className="w-8 h-8 text-teal-400 mr-2 transform scale-x-[-1]" /> {/* Flipped Quote for visual balance */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-400">"会议神游"涂鸦伴侣</h1>
        <Quote className="w-8 h-8 text-teal-400 ml-2" />
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="keywords" className="block text-sm font-medium text-neutral-300 mb-2">
            听到啥"天书"了？把会议里的"魔性"关键词丢进来，AI帮你画出来！(选填)
          </label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如：赋能、闭环、颗粒度、对齐一下、抓手..."
            className="w-full bg-neutral-800 border-neutral-700 focus:ring-sky-500 focus:border-sky-500 min-h-[70px]"
            rows={2}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full bg-teal-500 hover:bg-teal-600 text-white">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 灵感火花正在碰撞...
            </>
          ) : (
            <><Palette className="mr-2 h-4 w-4" /> 给我涂鸦灵感！
            </>
          )}
        </Button>
      </form>

      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">灵感枯竭了！</CardTitle>
          </CardHeader>
          <CardContent className="text-red-300">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !doodleIdea && (
         <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-400 mb-4" />
          <p className="text-neutral-400">AI正在连接异次元获取涂鸦灵感...✍️🎨</p>
        </div>
      )}

      {doodleIdea && !isLoading && (
        <Card className="flex-grow flex flex-col bg-neutral-800 border-neutral-700 shadow-inner">
          <CardHeader>
            <CardTitle className="text-teal-400 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" /> 涂鸦灵感，请查收！
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none break-words overflow-y-auto flex-grow">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doodleIdea}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MeetingDoodleBuddy;
